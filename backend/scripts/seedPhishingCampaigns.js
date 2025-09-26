const mongoose = require('mongoose');
const PhishingCampaign = require('../src/models/PhishingCampaign');
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

const sampleCampaigns = [
  {
    name: 'Suspicious Activity',
    description: 'Suspicious activity notice',
    template: 'email',
    content: {
      subject: 'Suspicious activity notice',
      body: `Dear User,

We have detected suspicious activity on your account. Please click the link below to verify your account security:

[Verify Account Security - Click Here]

If you did not authorize this activity, please contact our security team immediately.

Best regards,
IT Security Team`,
      senderName: 'IT Security Team',
      senderEmail: 'security@company.com'
    },
    status: 'draft',
    tags: ['security-alert', 'account-verification'],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: false,
      reminderDelay: 24
    }
  },
  {
    name: 'Device Login',
    description: 'New device login',
    template: 'email',
    content: {
      subject: 'New device login',
      body: `Hello,

We noticed a new login to your account from an unrecognized device:

Device: Unknown Device
Location: Unknown Location
Time: Just now

If this was you, you can ignore this message. If not, please secure your account by clicking the link below:

[Secure My Account - Click Here]

Thank you,
Security Team`,
      senderName: 'Security Team',
      senderEmail: 'alerts@company.com'
    },
    status: 'draft',
    tags: ['device-login', 'security-alert'],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: true,
      reminderDelay: 12
    }
  },
  {
    name: 'Account Activity Alert',
    description: 'Unusual Activity Detected on Your Account',
    template: 'email',
    content: {
      subject: 'Unusual Activity Detected on Your Account',
      body: `Important Security Notice

We have detected unusual activity on your account that requires immediate attention:

• Multiple failed login attempts
• Access from new IP address
• Potential unauthorized access attempt

To protect your account, please verify your identity immediately:

[Verify Identity Now - Click Here]

Failure to verify within 24 hours may result in account suspension.

IT Security Department`,
      senderName: 'IT Security Department',
      senderEmail: 'no-reply@company.com'
    },
    status: 'draft',
    tags: ['unusual-activity', 'account-security', 'urgent'],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: false,
      reminderDelay: 6
    }
  },
  {
    name: 'Password Reset Request',
    description: 'Password reset phishing template',
    template: 'email',
    content: {
      subject: 'Password Reset Request - Action Required',
      body: `Password Reset Request

Someone requested a password reset for your account. If this was you, click the link below to reset your password:

[Reset Password - Click Here]

If you did not request this reset, please ignore this email or contact support.

This link will expire in 1 hour for security purposes.

Support Team`,
      senderName: 'Support Team',
      senderEmail: 'support@company.com'
    },
    status: 'draft',
    tags: ['password-reset', 'authentication'],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: false,
      reminderDelay: 24
    }
  },
  {
    name: 'Software Update Notice',
    description: 'Fake software update notification',
    template: 'email',
    content: {
      subject: 'Critical Security Update Available',
      body: `Critical Security Update Required

A critical security update is available for your system. This update addresses several security vulnerabilities and must be installed immediately.

Click the link below to download and install the update:

[Download Security Update - Click Here]

Failure to install this update within 48 hours may leave your system vulnerable to security threats.

IT Department`,
      senderName: 'IT Department',
      senderEmail: 'updates@company.com'
    },
    status: 'draft',
    tags: ['software-update', 'security-patch', 'urgent'],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: true,
      reminderDelay: 48
    }
  }
];

const seedPhishingCampaigns = async () => {
  try {
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super-admin'] } });
    
    if (!adminUser) {
      console.log('No admin user found. Creating sample admin user...');
      const sampleAdmin = await User.create({
        name: 'Phishing Admin',
        email: 'phishing.admin@secureguard.com',
        password: 'admin123',
        role: 'admin',
        department: 'IT Security',
        position: 'Security Administrator',
        status: 'active'
      });
      
      // Assign the new admin as creator for all campaigns
      sampleCampaigns.forEach(campaign => {
        campaign.createdBy = sampleAdmin._id;
      });
    } else {
      // Use existing admin user
      sampleCampaigns.forEach(campaign => {
        campaign.createdBy = adminUser._id;
      });
    }

    // Clear existing campaigns
    await PhishingCampaign.deleteMany({});
    console.log('Cleared existing phishing campaigns...');

    // Insert sample campaigns
    const createdCampaigns = await PhishingCampaign.insertMany(sampleCampaigns);
    console.log(`✅ Successfully created ${createdCampaigns.length} sample phishing campaigns:`);
    
    createdCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name} (${campaign.status})`);
    });

    console.log('\n🎯 Sample phishing campaign data seeded successfully!');
    console.log('📊 You can now test the Phishing Simulation interface.');
    
  } catch (error) {
    console.error('Error seeding phishing campaigns:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

const runSeed = async () => {
  console.log('🌱 Starting phishing campaign data seeding...');
  await connectDB();
  await seedPhishingCampaigns();
};

runSeed();