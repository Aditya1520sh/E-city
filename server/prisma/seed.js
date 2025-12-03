const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables strictly from server env
// Prefer `server/.env` and then fallback to repo root `.env`
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const prisma = new PrismaClient();

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random date within range (days from now)
const randomDate = (startDays, endDays) => {
  const date = new Date();
  const days = startDays + Math.random() * (endDays - startDays);
  date.setDate(date.getDate() + days);
  return date;
};

// Helper to get random coordinates around a center point (Delhi approx)
const randomLocation = () => {
  const baseLat = 28.6139;
  const baseLng = 77.2090;
  // Variation of ~5km
  const lat = baseLat + (Math.random() - 0.5) * 0.1;
  const lng = baseLng + (Math.random() - 0.5) * 0.1;
  return { lat, lng };
};

async function main() {
  // Clear existing data before seeding new records (delete child collections first)
  console.log('Clearing existing data...');
  await prisma.pollVote.deleteMany({});
  await prisma.pollOption.deleteMany({});
  await prisma.poll.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords for security
  const adminPassword = await bcrypt.hash('admin', 10);
  const userPassword = await bcrypt.hash('user', 10);

  // Create Users - More diverse set
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ecity.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'admin',
    },
  });

  const users = [];
  const userNames = [
    'Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Verma', 'Vikram Singh',
    'Anjali Gupta', 'Rahul Khanna', 'Meera Reddy', 'Suresh Nair', 'Kavita Joshi'
  ];

  for (const name of userNames) {
    const email = name.toLowerCase().replace(' ', '.') + '@example.com';
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: userPassword,
        role: 'citizen',
      },
    });
    users.push(user);
  }

  console.log(`Created 1 admin and ${users.length} users`);

  // Create Departments (Robust data from populate-departments.js)
  const departmentsData = [
    {
      name: 'Public Works Department (PWD)',
      head: 'Rajesh Kumar',
      contact: '011-23456789',
      email: 'pwd@ecity.gov.in',
      location: 'Civil Lines, Block A',
      description: 'Responsible for infrastructure development, road maintenance, and public buildings.',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
    },
    {
      name: 'Health Department',
      head: 'Dr. Sarah Khan',
      contact: '011-23456790',
      email: 'health@ecity.gov.in',
      location: 'City Hospital Complex',
      description: 'Oversees public health services, hospitals, and sanitation programs.',
      imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80'
    },
    {
      name: 'Education Department',
      head: 'Vikram Singh',
      contact: '011-23456791',
      email: 'education@ecity.gov.in',
      location: 'Secretariat Building, 2nd Floor',
      description: 'Manages government schools, literacy programs, and educational initiatives.',
      imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80'
    },
    {
      name: 'Water Supply Board',
      head: 'Anita Desai',
      contact: '011-23456792',
      email: 'water@ecity.gov.in',
      location: 'Water Works Compound',
      description: 'Ensures clean water supply and manages sewage treatment plants.',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80'
    },
    {
      name: 'Electricity Department',
      head: 'Robert D\'Souza',
      contact: '011-23456793',
      email: 'power@ecity.gov.in',
      location: 'Power Grid Station, Sector 5',
      description: 'Manages power distribution, street lighting, and electrical maintenance.',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80'
    },
    {
      name: 'Transportation Department',
      head: 'Priya Sharma',
      contact: '011-23456794',
      email: 'transport@ecity.gov.in',
      location: 'Traffic Control Center, Sector 8',
      description: 'Oversees public transportation, traffic management, and road safety programs.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'
    },
    {
      name: 'Environmental Services',
      head: 'Mohammed Ahmed',
      contact: '011-23456795',
      email: 'environment@ecity.gov.in',
      location: 'Green Zone Office, Sector 12',
      description: 'Manages waste management, recycling programs, parks, and environmental conservation.',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
    }
  ];

  for (const dept of departmentsData) {
    await prisma.department.create({ data: dept });
  }
  console.log(`Created ${departmentsData.length} departments`);

  // Create Issues - Non-uniform distribution across departments, categories, and statuses
  const categories = ['infrastructure', 'sanitation', 'electricity', 'other'];
  const statusWeights = [
    { status: 'pending', weight: 0.4 },
    { status: 'in-progress', weight: 0.3 },
    { status: 'resolved', weight: 0.2 },
    { status: 'rejected', weight: 0.1 },
  ];

  const issueTemplates = {
    infrastructure: [
      { title: 'Pothole on Main Road', desc: 'Large pothole causing traffic slowdown.' },
      { title: 'Broken Sidewalk', desc: 'Sidewalk tiles are broken and dangerous for pedestrians.' },
      { title: 'Damaged Bus Stop', desc: 'Bus stop shelter roof is leaking.' },
      { title: 'Fallen Tree Blocking Road', desc: 'A large tree has fallen after the storm.' },
      { title: 'Missing Manhole Cover', desc: 'Open manhole posing serious risk.' }
    ],
    sanitation: [
      { title: 'Garbage Pileup', desc: 'Garbage has not been collected for 3 days.' },
      { title: 'Blocked Drain', desc: 'Drainage water overflowing onto the street.' },
      { title: 'Dirty Public Toilet', desc: 'Public toilet in market area needs cleaning.' },
      { title: 'Dead Animal on Road', desc: 'Please remove dead animal causing foul smell.' },
      { title: 'Mosquito Breeding Ground', desc: 'Stagnant water collecting in empty plot.' }
    ],
    electricity: [
      { title: 'Street Light Not Working', desc: 'Street light pole #45 is dark.' },
      { title: 'Loose Hanging Wires', desc: 'Dangerous electrical wires hanging low.' },
      { title: 'Transformer Sparking', desc: 'Sparks seen coming from local transformer.' },
      { title: 'Power Fluctuation', desc: 'Severe voltage fluctuation damaging appliances.' },
      { title: 'Electric Pole Tilted', desc: 'Pole looks unstable after heavy winds.' }
    ],
    other: [
      { title: 'Stray Dog Menace', desc: 'Aggressive stray dogs chasing bikers.' },
      { title: 'Loud Noise Pollution', desc: 'Construction work causing noise late at night.' },
      { title: 'Illegal Parking', desc: 'Cars parked in no-parking zone blocking traffic.' },
      { title: 'Park Bench Broken', desc: 'Benches in community park are vandalized.' },
      { title: 'Graffiti on Public Wall', desc: 'Offensive graffiti needs removal.' }
    ]
  };

  // Department-specific category biases (non-uniform)
  const categoryBias = {
    'Public Works Department (PWD)': { infrastructure: 0.6, sanitation: 0.2, electricity: 0.15, other: 0.05 },
    'Health Department': { sanitation: 0.45, other: 0.35, infrastructure: 0.1, electricity: 0.1 },
    'Education Department': { infrastructure: 0.3, sanitation: 0.3, other: 0.3, electricity: 0.1 },
    'Water Supply Board': { sanitation: 0.5, infrastructure: 0.25, other: 0.15, electricity: 0.1 },
    'Electricity Department': { electricity: 0.65, infrastructure: 0.2, sanitation: 0.1, other: 0.05 },
    'Transportation Department': { infrastructure: 0.5, other: 0.25, sanitation: 0.2, electricity: 0.05 },
    'Environmental Services': { sanitation: 0.5, other: 0.3, infrastructure: 0.15, electricity: 0.05 },
  };

  const pickWeighted = (weights) => {
    const r = Math.random();
    let acc = 0;
    for (const w of weights) {
      acc += w.weight;
      if (r <= acc) return w.status;
    }
    return weights[weights.length - 1].status;
  };

  const pickCategoryFromBias = (bias) => {
    const entries = Object.entries(bias);
    const r = Math.random();
    let acc = 0;
    for (const [cat, wt] of entries) {
      acc += wt;
      if (r <= acc) return cat;
    }
    return entries[entries.length - 1][0];
  };

  // Fetch departments created to tag issues
  const existingDepartments = await prisma.department.findMany();

  const issuesToCreate = [];
  const targetTotalIssues = 20;

  // Generate a non-uniform number of issues per department (2-6 each, capped by total)
  for (const dept of existingDepartments) {
    if (issuesToCreate.length >= targetTotalIssues) break;
    const perDeptCount = Math.floor(2 + Math.random() * 5); // 2..6
    const bias = categoryBias[dept.name] || { infrastructure: 0.25, sanitation: 0.25, electricity: 0.25, other: 0.25 };

    for (let k = 0; k < perDeptCount && issuesToCreate.length < targetTotalIssues; k++) {
      const category = pickCategoryFromBias(bias);
      const status = pickWeighted(statusWeights);
      const template = random(issueTemplates[category]);
      const user = random(users);
      const loc = randomLocation();

      const uniqueTitle = `${template.title} - ${['Sector 4', 'Market Area', 'Main Road', 'Block B', 'Near School', 'Sector 9', 'Community Park'][Math.floor(Math.random() * 7)]}`;

      const issueBase = {
        title: uniqueTitle,
        description: template.desc,
        category,
        status,
        location: `Lat: ${loc.lat.toFixed(4)}, Long: ${loc.lng.toFixed(4)}`,
        latitude: loc.lat,
        longitude: loc.lng,
        userId: user.id,
        upvotes: Math.floor(Math.random() * 70),
        createdAt: randomDate(-45, 0), // Past 45 days for more spread
        assignedDepartment: dept.name,
      };

      const statusSpecific =
        status === 'resolved'
          ? { resolutionRemarks: random(['Fixed successfully.', 'Temporary fix applied.', 'Resolved after inspection.']), resolutionTime: randomDate(-10, 0), resolutionOfficer: random(['Officer A', 'Officer B', 'Officer C']) }
          : status === 'rejected'
          ? { rejectionReason: random(['Not under our jurisdiction.', 'Insufficient details provided.', 'Duplicate of existing report.']), alternativeSuggestion: random(['Contact local RWA.', 'Submit clearer photos.', 'Report to state authority.']) }
          : status === 'in-progress'
          ? { actionTaken: random(['Team dispatched.', 'Site inspection scheduled.', 'Materials procured.']), assignedOfficer: random(['Officer D', 'Officer E', 'Officer F']), estimatedCompletion: randomDate(1, 14) }
          : {};

      issuesToCreate.push({ ...issueBase, ...statusSpecific });
    }
  }

  for (const issue of issuesToCreate) {
    const createdIssue = await prisma.issue.create({ data: issue });

    // Add 0-3 random comments with non-uniform probability
    const addComments = Math.random() > 0.35; // ~65% issues have comments
    if (addComments) {
      const numComments = Math.floor(Math.random() * 4); // 0..3
      for (let j = 0; j < numComments; j++) {
        await prisma.comment.create({
          data: {
            content: random([
              'I agree!',
              'This is urgent.',
              'Facing same issue.',
              'Please fix ASAP.',
              'Any update?',
              'Thanks for taking action.',
              'Following up on this.',
            ]),
            userId: random(users).id,
            issueId: createdIssue.id,
          },
        });
      }
    }
  }
  console.log(`Created ${issuesToCreate.length} issues across ${existingDepartments.length} departments`);

  // Create Announcements - 20 items
  const announcementTemplates = [
    { title: 'Water Supply Alert', content: 'Water supply disruption expected tomorrow.', priority: 'high' },
    { title: 'Vaccination Camp', content: 'Free covid booster shots available at City Hospital.', priority: 'medium' },
    { title: 'Road Closure', content: 'MG Road closed for repairs this weekend.', priority: 'high' },
    { title: 'New Park Opening', content: 'Sector 5 park opening ceremony on Sunday.', priority: 'low' },
    { title: 'Tax Deadline Extended', content: 'Property tax filing deadline extended by 1 week.', priority: 'medium' },
    { title: 'Festival Guidelines', content: 'Safety guidelines for upcoming festival season.', priority: 'medium' },
    { title: 'Power Cut Schedule', content: 'Scheduled maintenance power cut in Sector 12.', priority: 'high' },
    { title: 'Library Membership', content: '50% off on annual library membership.', priority: 'low' },
    { title: 'Traffic Advisory', content: 'Heavy traffic expected due to VIP movement.', priority: 'medium' },
    { title: 'Clean City Drive', content: 'Join us for the cleanliness drive this Saturday.', priority: 'low' }
  ];

  for (let i = 0; i < 12; i++) {
    const template = random(announcementTemplates);
    await prisma.announcement.create({
      data: {
        title: `${template.title} ${i + 1}`, // Make unique
        content: template.content,
        priority: template.priority,
        createdAt: randomDate(-15, 0)
      }
    });
  }
  console.log(`Created 12 announcements`);



  // Create Locations
  const locationsData = [
    {
      name: 'E-City General Hospital',
      type: 'hospital',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Medical District, City Center',
      description: 'Main government hospital with 24/7 emergency services'
    },
    {
      name: 'City Public School',
      type: 'school',
      latitude: 28.6200,
      longitude: 77.2000,
      address: 'Sector 12, Education Zone',
      description: 'Co-educational public school with excellent facilities'
    },
    {
      name: 'Community Center',
      type: 'community_center',
      latitude: 28.6100,
      longitude: 77.2250,
      address: 'Cultural District, City Center',
      description: 'Hub for cultural events and community gatherings'
    },
    {
      name: 'Municipal Corporation Office',
      type: 'mcd_office',
      latitude: 28.6150,
      longitude: 77.2100,
      address: 'Civic Center Road, Downtown',
      description: 'Main administrative office for city services'
    },
    {
      name: 'Central Plaza',
      type: 'landmark',
      latitude: 28.6120,
      longitude: 77.2130,
      address: 'Central Plaza, Downtown',
      description: 'Popular central meeting point and shopping area'
    },
    {
      name: 'City Hospital Emergency Wing',
      type: 'hospital',
      latitude: 28.6180,
      longitude: 77.2050,
      address: 'Medical District Extension',
      description: '24/7 emergency and trauma care center'
    },
    {
      name: 'MCD Office Green Park',
      type: 'mcd_office',
      latitude: 28.6080,
      longitude: 77.2030,
      address: 'Green Park, City South',
      description: 'Zone office for southern sector services'
    },
    {
      name: 'Tech Park',
      type: 'landmark',
      latitude: 28.6250,
      longitude: 77.2170,
      address: 'IT Corridor, Cyber City',
      description: 'Modern tech hub and business district'
    }
  ];

  for (const loc of locationsData) {
    await prisma.location.create({ data: loc });
  }
  console.log(`Created ${locationsData.length} locations`);

  // Create Events - 10 items (User requested decrease)
  const eventTypes = ['cultural', 'educational', 'healthcare', 'workshop', 'general'];
  const eventImages = {
    cultural: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80',
    educational: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    healthcare: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
    workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    general: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'
  };

  for (let i = 0; i < 10; i++) {
    const type = random(eventTypes);
    const isPast = Math.random() > 0.7; // 30% past events
    const date = isPast ? randomDate(-30, -1) : randomDate(1, 60);

    const event = await prisma.event.create({
      data: {
        title: `Community ${type.charAt(0).toUpperCase() + type.slice(1)} Event ${i + 1}`,
        description: `Join us for a wonderful ${type} event. Great opportunity to meet neighbors and learn something new.`,
        date: date,
        location: `Community Center Hall ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        organizer: 'City Council',
        type: type,
        imageUrl: eventImages[type]
      }
    });

    // Add random participants
    const numParticipants = Math.floor(Math.random() * 5);
    if (numParticipants > 0) {
      const participantIds = [];
      for (let j = 0; j < numParticipants; j++) {
        participantIds.push(random(users).id);
      }
      // Unique participants
      const uniqueIds = [...new Set(participantIds)];

      await prisma.event.update({
        where: { id: event.id },
        data: {
          participants: {
            connect: uniqueIds.map(id => ({ id }))
          }
        }
      });
    }
  }
  console.log(`Created 10 events`);

  // Create Polls (Keep existing)
  const pollsData = [
    {
      question: 'Which civic improvement should be our top priority?',
      options: ['Better Road Infrastructure', 'More Green Spaces & Parks', 'Improved Waste Management', 'Enhanced Street Lighting']
    },
    {
      question: 'Should the city implement car-free Sundays?',
      options: ['Yes, every Sunday', 'Yes, once a month', 'No, causes inconvenience', 'Only in specific zones']
    }
  ];

  for (const pollData of pollsData) {
    await prisma.poll.create({
      data: {
        question: pollData.question,
        options: {
          create: pollData.options.map(opt => ({ text: opt }))
        }
      }
    });
  }
  console.log(`Created ${pollsData.length} polls`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

