import 'dotenv/config';
import { db } from '../db';
import { service, timeSlot } from '../db/schema/queue';
import { eq } from 'drizzle-orm';

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...');

    // Create sample services
    const servicesData = [
      {
        name: 'Haircut',
        description: 'Professional haircut and styling',
        duration: 30,
      },
      {
        name: 'Hair Color',
        description: 'Full hair coloring service',
        duration: 120,
      },
      {
        name: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        duration: 15,
      },
      {
        name: 'Consultation',
        description: 'Initial consultation for new clients',
        duration: 20,
      },
    ];

    console.log('📝 Creating services...');
    const createdServices = [];
    for (const serviceData of servicesData) {
      const [createdService] = await db
        .insert(service)
        .values({
          ...serviceData,
          isActive: true,
        })
        .returning();
      createdServices.push(createdService);
      console.log(`✅ Created service: ${createdService.name}`);
    }

    // Create sample time slots for the next 7 days
    console.log('⏰ Creating time slots...');
    const timeSlotsData = [];
    const now = new Date();

    for (let daysFromNow = 0; daysFromNow < 7; daysFromNow++) {
      const currentDate = new Date(now);
      currentDate.setDate(currentDate.getDate() + daysFromNow);

      // Only create slots for future dates (not past times today)
      if (daysFromNow === 0 && currentDate.getHours() >= 17) {
        continue; // Skip today if it's past 5 PM
      }

      for (const service of createdServices) {
        // Create multiple time slots per day
        const startHour = daysFromNow === 0 ? Math.max(9, currentDate.getHours() + 1) : 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
          // Skip past times for today
          if (daysFromNow === 0 && hour <= currentDate.getHours()) {
            continue;
          }

          const startTime = new Date(currentDate);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + service.duration);

          // Make sure we don't go past closing time
          if (endTime.getHours() > endHour || (endTime.getHours() === endHour && endTime.getMinutes() > 0)) {
            continue;
          }

          const [createdTimeSlot] = await db
            .insert(timeSlot)
            .values({
              serviceId: service.id,
              startTime,
              endTime,
              capacity: 1,
              isAvailable: true,
            })
            .returning();

          timeSlotsData.push(createdTimeSlot);
        }
      }
    }

    console.log(`✅ Created ${timeSlotsData.length} time slots`);
    console.log('🎉 Data seeding completed successfully!');

    console.log('\n📊 Summary:');
    console.log(`- Services: ${createdServices.length}`);
    console.log(`- Time Slots: ${timeSlotsData.length}`);
    console.log('\nYou can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedData();