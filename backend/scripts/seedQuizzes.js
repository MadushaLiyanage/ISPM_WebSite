const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');
const User = require('../src/models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sampleQuizzes = [
  {
    title: 'Data Classification & Handling Policy',
    description: 'Apply data classification rules to everyday work scenarios.',
    category: 'cybersecurity',
    difficulty: 'beginner',
    timeLimit: 15,
    passingScore: 80,
    status: 'published',
    tags: ['data-protection', 'classification', 'policy'],
    questions: [
      {
        question: 'What is the main purpose of data classification?',
        type: 'multiple-choice',
        options: [
          { text: 'To organize files alphabetically', isCorrect: false },
          { text: 'To determine appropriate security controls', isCorrect: true },
          { text: 'To reduce storage costs', isCorrect: false },
          { text: 'To improve network speed', isCorrect: false }
        ],
        explanation: 'Data classification helps determine the appropriate level of security controls and handling procedures based on data sensitivity.',
        points: 1
      },
      {
        question: 'Which data classification level requires the highest security?',
        type: 'multiple-choice',
        options: [
          { text: 'Public', isCorrect: false },
          { text: 'Internal', isCorrect: false },
          { text: 'Confidential', isCorrect: false },
          { text: 'Restricted', isCorrect: true }
        ],
        explanation: 'Restricted data requires the highest level of security controls and handling procedures.',
        points: 1
      },
      {
        question: 'Employee personal information should be classified as confidential.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Employee personal information contains sensitive data that should be protected and classified as confidential.',
        points: 1
      }
    ],
    settings: {
      shuffleQuestions: false,
      shuffleAnswers: true,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttempts: 3
    },
    publishedAt: new Date()
  },
  {
    title: 'Phishing Awareness Training',
    description: 'Learn how to identify and properly handle different types of phishing attempts.',
    category: 'phishing',
    difficulty: 'intermediate',
    timeLimit: 20,
    passingScore: 75,
    status: 'draft',
    tags: ['phishing', 'email-security', 'awareness'],
    questions: [
      {
        question: 'What is the most common type of phishing attack?',
        type: 'multiple-choice',
        options: [
          { text: 'Email phishing', isCorrect: true },
          { text: 'SMS phishing', isCorrect: false },
          { text: 'Voice phishing', isCorrect: false },
          { text: 'Social media phishing', isCorrect: false }
        ],
        explanation: 'Email phishing remains the most common attack vector, accounting for the majority of phishing attempts.',
        points: 1
      },
      {
        question: 'What should you do if you receive a suspicious email?',
        type: 'multiple-choice',
        options: [
          { text: 'Click links to verify legitimacy', isCorrect: false },
          { text: 'Forward it to colleagues for opinions', isCorrect: false },
          { text: 'Report it to IT security team', isCorrect: true },
          { text: 'Reply asking for verification', isCorrect: false }
        ],
        explanation: 'Always report suspicious emails to the IT security team rather than interacting with them.',
        points: 1
      }
    ],
    settings: {
      shuffleQuestions: true,
      shuffleAnswers: true,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttempts: 5
    }
  },
  {
    title: 'Password Security Best Practices',
    description: 'Learn the essential principles of creating and managing secure passwords.',
    category: 'cybersecurity',
    difficulty: 'beginner',
    timeLimit: 10,
    passingScore: 80,
    status: 'published',
    tags: ['passwords', 'authentication', 'security'],
    questions: [
      {
        question: 'What is the minimum recommended length for a secure password?',
        type: 'multiple-choice',
        options: [
          { text: '6 characters', isCorrect: false },
          { text: '8 characters', isCorrect: false },
          { text: '12 characters', isCorrect: true },
          { text: '16 characters', isCorrect: false }
        ],
        explanation: 'Current security standards recommend a minimum of 12 characters for passwords.',
        points: 1
      },
      {
        question: 'You should use the same password for multiple accounts.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'Using unique passwords for each account prevents credential stuffing attacks.',
        points: 1
      }
    ],
    settings: {
      shuffleQuestions: false,
      shuffleAnswers: true,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttempts: 3
    },
    publishedAt: new Date()
  }
];

const seedQuizzes = async () => {
  try {
    // Find an admin user to assign as author
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super-admin'] } });
    
    if (!adminUser) {
      console.log('No admin user found. Creating sample admin user...');
      const sampleAdmin = await User.create({
        name: 'Quiz Admin',
        email: 'quiz.admin@secureguard.com',
        password: 'admin123',
        role: 'admin',
        department: 'IT Security',
        position: 'Security Administrator',
        status: 'active'
      });
      
      // Assign the new admin as author for all quizzes
      sampleQuizzes.forEach(quiz => {
        quiz.author = sampleAdmin._id;
      });
    } else {
      // Use existing admin user
      sampleQuizzes.forEach(quiz => {
        quiz.author = adminUser._id;
      });
    }

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes...');

    // Insert sample quizzes
    const createdQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`✅ Successfully created ${createdQuizzes.length} sample quizzes:`);
    
    createdQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (${quiz.status})`);
    });

    console.log('\n🎯 Sample quiz data seeded successfully!');
    console.log('📊 You can now test the Quiz Management interface.');
    
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

const runSeed = async () => {
  console.log('🌱 Starting quiz data seeding...');
  await connectDB();
  await seedQuizzes();
};

runSeed();