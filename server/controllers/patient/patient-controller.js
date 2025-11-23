// server/controllers/patient/patient-controller.js
// Minimal test controller — returns example dashboard data

const getPatientDashboard = async (req, res) => {
  try {
    // if auth present, you can read req.user, otherwise fallback to query param
    const userId = req.user?.id || req.query?.userId || 'test-user';

    const data = {
      healthScore: 82,
      recentReports: [
        { id: 'r1', title: 'Blood Test - CBC', date: new Date().toISOString() },
        { id: 'r2', title: 'Chest X-Ray', date: new Date(Date.now()-86400000).toISOString() }
      ],
      family: [
        { id: 'f1', name: 'Mom', relation: 'mother', latestStatus: 'BP: 130/80' }
      ],
      recommendations: [
        "Follow up on iron levels in 2 weeks",
        "Keep hydrated and rest"
      ],
      quickSummary: "Basic summary (mock). Replace with real logic later."
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error('getPatientDashboard error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPatientDashboard };
