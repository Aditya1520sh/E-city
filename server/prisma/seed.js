const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecity.com' },
    update: {},
    create: {
      email: 'admin@ecity.com',
      name: 'City Admin',
      password: 'admin',
      role: 'admin',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password: 'user',
      role: 'citizen',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: 'user',
      role: 'citizen',
    },
  });

  console.log('Users created');

  // Create Issues
  const issuesData = [
    {
      title: 'Large Pothole on 5th Avenue',
      description: 'There is a massive pothole causing traffic delays near the central park entrance.',
      category: 'infrastructure',
      location: '5th Avenue, Downtown',
      status: 'pending',
      userId: user1.id,
      upvotes: 5,
    },
    {
      title: 'Street Light Broken',
      description: 'The street light at the corner of Elm and Oak is flickering and mostly off.',
      category: 'electricity',
      location: 'Elm St & Oak Ave',
      status: 'in-progress',
      userId: user2.id,
      upvotes: 12,
    },
    {
      title: 'Garbage Pileup',
      description: 'Garbage has not been collected for 3 days in the residential area.',
      category: 'sanitation',
      location: 'Sunset Boulevard',
      status: 'resolved',
      userId: user1.id,
      upvotes: 3,
    },
    {
      title: 'Water Leakage',
      description: 'Main water pipe seems to be leaking, flooding the sidewalk.',
      category: 'infrastructure',
      location: 'Market Street',
      status: 'pending',
      userId: user2.id,
      upvotes: 8,
    },
    {
      title: 'Park Bench Broken',
      description: 'Wooden bench in the community park is broken and dangerous.',
      category: 'other',
      location: 'Community Park',
      status: 'pending',
      userId: user1.id,
      upvotes: 1,
    }
  ];

  for (const issue of issuesData) {
    const createdIssue = await prisma.issue.create({
      data: issue,
    });
    
    // Add a comment
    await prisma.comment.create({
      data: {
        content: 'I noticed this too! Hope it gets fixed soon.',
        userId: user2.id,
        issueId: createdIssue.id,
      }
    });
  }

  // Create Locations
  const locationsData = [
    {
      name: 'AIIMS Delhi',
      type: 'hospital',
      latitude: 28.5650,
      longitude: 77.2060,
      address: 'Ansari Nagar, New Delhi'
    },
    {
      name: 'Delhi Public School, RK Puram',
      type: 'school',
      latitude: 28.5700,
      longitude: 77.1700,
      address: 'Sector 12, RK Puram'
    },
    {
      name: 'India Habitat Centre',
      type: 'community_center',
      latitude: 28.5890,
      longitude: 77.2250,
      address: 'Lodhi Road, New Delhi'
    },
    {
      name: 'MCD Civic Centre',
      type: 'mcd_office',
      latitude: 28.6415,
      longitude: 77.2295,
      address: 'Minto Road, New Delhi'
    },
    {
      name: 'Connaught Place',
      type: 'landmark',
      latitude: 28.6304,
      longitude: 77.2177,
      address: 'Connaught Place, New Delhi'
    },
    {
      name: 'Safdarjung Hospital',
      type: 'hospital',
      latitude: 28.5680,
      longitude: 77.2050,
      address: 'Ansari Nagar West'
    },
    {
      name: 'MCD Office Green Park',
      type: 'mcd_office',
      latitude: 28.5580,
      longitude: 77.2030,
      address: 'Green Park, New Delhi'
    }
  ];

  for (const loc of locationsData) {
    await prisma.location.create({ data: loc });
  }

  // Create Events
  const eventsData = [
    {
      title: 'Annual Cultural Fest',
      description: 'A celebration of our city\'s diverse culture with food, music, and dance.',
      date: new Date('2025-12-15T10:00:00Z'),
      location: 'Central Park',
      organizer: 'City Culture Committee',
      type: 'cultural',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Tech for Seniors Workshop',
      description: 'Learn how to use smartphones and digital banking safely.',
      date: new Date('2025-11-28T14:00:00Z'),
      location: 'Community Centre, Sector 4',
      organizer: 'Digital Literacy Mission',
      type: 'educational',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Free Health Checkup Camp',
      description: 'General physician, dental, and eye checkups for all citizens.',
      date: new Date('2025-12-05T09:00:00Z'),
      location: 'Government Hospital, Civil Lines',
      organizer: 'Health Department',
      type: 'healthcare',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Waste Management Workshop',
      description: 'Learn about composting and recycling at home.',
      date: new Date('2025-12-10T11:00:00Z'),
      location: 'Eco Park',
      organizer: 'Green City Initiative',
      type: 'workshop',
      imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Yoga in the Park',
      description: 'Morning yoga session for mental and physical wellness.',
      date: new Date('2025-11-30T06:30:00Z'),
      location: 'Nehru Park',
      organizer: 'Wellness Club',
      type: 'healthcare',
      imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  for (const event of eventsData) {
    await prisma.event.create({ data: event });
  }

  // Create Announcements
  const announcementsData = [
    {
      title: 'New Metro Line Inauguration',
      content: 'The new Pink Line extension will be open to the public starting next Monday.',
      priority: 'high'
    },
    {
      title: 'Winter School Timings',
      content: 'All schools will follow winter timings (9 AM - 3 PM) starting Dec 1st.',
      priority: 'medium'
    },
    {
      title: 'Property Tax Deadline Extended',
      content: 'The last date to file property tax without penalty has been extended to Dec 31st.',
      priority: 'high'
    },
    {
      title: 'Flower Show 2025',
      content: 'Visit the annual flower show at the Botanical Gardens this weekend.',
      priority: 'low'
    }
  ];

  for (const ann of announcementsData) {
    await prisma.announcement.create({ data: ann });
  }

  // Create Polls
  const pollsData = [
    {
      question: 'Where should the new public library be located?',
      options: ['Sector 4 Community Centre', 'Near Central Park', 'Old City Complex', 'University Campus']
    },
    {
      question: 'What should be the priority for next month\'s budget?',
      options: ['Road Repairs', 'Park Maintenance', 'Street Lighting', 'Waste Management']
    },
    {
      question: 'Do you support the car-free Sunday initiative?',
      options: ['Yes, fully support', 'Maybe, once a month', 'No, it causes inconvenience']
    }
  ];

  for (const pollData of pollsData) {
    const poll = await prisma.poll.create({
      data: {
        question: pollData.question,
        options: {
          create: pollData.options.map(opt => ({ text: opt }))
        }
      }
    });
  }

  // Create Departments
  const departmentsData = [
    {
      name: 'Public Works Department',
      head: 'Rajesh Kumar',
      contact: '011-23456789',
      email: 'pwd@ecity.gov.in',
      location: 'Civil Lines, Block A',
      description: 'Responsible for infrastructure development, road maintenance, and public buildings.'
    },
    {
      name: 'Health Department',
      head: 'Dr. Sarah Khan',
      contact: '011-23456790',
      email: 'health@ecity.gov.in',
      location: 'City Hospital Complex',
      description: 'Oversees public health services, hospitals, and sanitation programs.'
    },
    {
      name: 'Education Department',
      head: 'Vikram Singh',
      contact: '011-23456791',
      email: 'education@ecity.gov.in',
      location: 'Secretariat Building, 2nd Floor',
      description: 'Manages government schools, literacy programs, and educational initiatives.'
    },
    {
      name: 'Water Supply Board',
      head: 'Anita Desai',
      contact: '011-23456792',
      email: 'water@ecity.gov.in',
      location: 'Water Works Compound',
      description: 'Ensures clean water supply and manages sewage treatment plants.'
    },
    {
      name: 'Electricity Department',
      head: 'Robert D\'Souza',
      contact: '011-23456793',
      email: 'power@ecity.gov.in',
      location: 'Power Grid Station, Sector 5',
      description: 'Manages power distribution, street lighting, and electrical maintenance.'
    }
  ];

  for (const dept of departmentsData) {
    await prisma.department.create({ data: dept });
  }

  console.log('Seeding completed');
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
