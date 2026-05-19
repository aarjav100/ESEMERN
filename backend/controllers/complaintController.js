const Complaint = require('../models/Complaint');
const axios = require('axios');

// Helper function to query OpenRouter AI API
const queryAI = async (title, description, category) => {
  const prompt = `
You are an advanced AI Complaint Management system.
Analyze the citizen's complaint details and return a strictly structured JSON response containing:
1. "urgency": Suggest urgency level. Must be strictly one of: "Low", "Medium", "High", "Critical".
2. "department": Suggest the concerned administrative department. Pick from: "Water Supply Department", "Sanitation Department", "Electricity Department", "Roads & Traffic Department", "General Administration".
3. "summary": A concise 1-sentence summary of the core issue.
4. "autoResponse": A polite automated response acknowledging the complaint, indicating which department has been assigned, and providing relevant safety or processing updates.

Complaint Details:
- Title: ${title}
- Category: ${category}
- Description: ${description}

Format your reply strictly as a JSON object matching this structure. Return ONLY the JSON object. Do not include markdown block ticks (\`\`\`) or any conversational intro/outro text.
{
  "urgency": "...",
  "department": "...",
  "summary": "...",
  "autoResponse": "..."
}
`;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 10000 // 10 seconds timeout
    });

    let rawContent = response.data.choices[0].message.content.trim();
    
    // Clean potential markdown wrap
    if (rawContent.startsWith("```json")) {
      rawContent = rawContent.substring(7, rawContent.length - 3).trim();
    } else if (rawContent.startsWith("```")) {
      rawContent = rawContent.substring(3, rawContent.length - 3).trim();
    }

    return JSON.parse(rawContent);
  } catch (error) {
    console.error("OpenRouter AI completion failed, executing fallback:", error.message);
    
    // Offline Static Rule Fallback
    const lowerDesc = (description || '').toLowerCase() + ' ' + (title || '').toLowerCase();
    let urgency = "Medium";
    let department = "General Administration";
    let summary = `Complaint regarding ${title}.`;

    if (lowerDesc.includes('leak') || lowerDesc.includes('water') || lowerDesc.includes('pipeline') || lowerDesc.includes('drain')) {
      department = "Water Supply Department";
      urgency = lowerDesc.includes('burst') || lowerDesc.includes('flood') ? "High" : "Medium";
    } else if (lowerDesc.includes('wire') || lowerDesc.includes('electricity') || lowerDesc.includes('shock') || lowerDesc.includes('power') || lowerDesc.includes('blackout')) {
      department = "Electricity Department";
      urgency = lowerDesc.includes('shock') || lowerDesc.includes('spark') ? "Critical" : "High";
    } else if (lowerDesc.includes('garbage') || lowerDesc.includes('waste') || lowerDesc.includes('trash') || lowerDesc.includes('dump') || lowerDesc.includes('sewer')) {
      department = "Sanitation Department";
      urgency = "Low";
    } else if (lowerDesc.includes('pothole') || lowerDesc.includes('road') || lowerDesc.includes('traffic') || lowerDesc.includes('signal')) {
      department = "Roads & Traffic Department";
      urgency = "Medium";
    }

    return {
      urgency,
      department,
      summary,
      autoResponse: `Dear Citizen, we have received your complaint regarding "${title}". The concerned department (${department}) has been notified. We will update you shortly.`
    };
  }
};

// 1. Add Complaint
// POST /api/complaints
exports.addComplaint = async (req, res) => {
  try {
    const { name, email, title, description, category, location } = req.body;

    if (!name || !email || !title || !description || !category || !location) {
      return res.status(400).json({ error: 'All fields (name, email, title, description, category, location) are required.' });
    }

    // Call AI to analyze the complaint details
    const aiResult = await queryAI(title, description, category);

    const newComplaint = new Complaint({
      name,
      email,
      title,
      description,
      category,
      location,
      aiAnalysis: aiResult
    });

    await newComplaint.save();

    res.status(201).json({
      message: 'Complaint stored successfully',
      complaint: newComplaint
    });
  } catch (error) {
    console.error('Error adding complaint:', error);
    res.status(500).json({ error: `Failed to register complaint: ${error.message}` });
  }
};

// 2. Get All Complaints
// GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const { category, urgency, status } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query['aiAnalysis.urgency'] = urgency;

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: `Failed to fetch complaints: ${error.message}` });
  }
};

// 3. Update Complaint Status
// PUT /api/complaints/:id
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: 'Status field is required.' });
    }

    if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be Pending, In Progress, Resolved, or Rejected.' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: `Failed to update status: ${error.message}` });
  }
};

// 4. Search Complaint by Location
// GET /api/complaints/search?location=Ghaziabad
exports.searchComplaintsByLocation = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location search term is required.' });
    }

    const complaints = await Complaint.find({
      location: { $regex: location, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error searching complaints:', error);
    res.status(500).json({ error: `Failed to search complaints: ${error.message}` });
  }
};

// 5. AI Complaint Analyzer
// POST /api/ai/analyze
exports.analyzeComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required fields.' });
    }

    const aiResult = await queryAI(title, description, category);
    res.status(200).json(aiResult);
  } catch (error) {
    console.error('AI analysis API error:', error);
    res.status(500).json({ error: `AI analysis failed: ${error.message}` });
  }
};

// 6. Delete Complaint
// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }
    res.status(200).json({ message: 'Complaint removed successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: `Failed to delete complaint: ${error.message}` });
  }
};

// 7. Chat with CivicBot (Context Aware)
// POST /api/chat
exports.chatWithBot = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages history is required' });
    }

    const complaints = await Complaint.find();
    const complaintsSummary = complaints.map(c => 
      `- Title: "${c.title}", Category: "${c.category}", Location: "${c.location}", Status: "${c.status}", Urgency: "${c.aiAnalysis?.urgency || 'Medium'}", Summary: "${c.aiAnalysis?.summary || 'N/A'}"`
    ).join('\n');

    const systemPrompt = `You are a helpful, professional AI Civic Support Assistant named CivicBot.
You have access to the citizen complaint registry database below.
Your job is to answer questions about complaints, tell users which department handles what, recommend safety actions for issues like sparking wires, or provide updates on existing complaints.

Here is the active complaint database:
${complaintsSummary || "No complaints registered yet."}

Be conversational, concise, professional, and friendly. Use markdown to format your replies (e.g. lists, bold text). Always encourage citizens to stay safe!`;

    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-4o-mini",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const aiMessage = response.data.choices[0].message.content;
    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    console.error('Error from Chatbot AI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get bot response' });
  }
};
