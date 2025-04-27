const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const userId = req.user.id; // From auth middleware

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        userId
      }
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get All Events (for user)
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await prisma.event.findMany({
      where: { userId }
    });

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add Task to Event
exports.addTaskToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        eventId: parseInt(eventId)
      }
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get Tasks of Event
exports.getTasksOfEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { eventId: parseInt(eventId) }
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
