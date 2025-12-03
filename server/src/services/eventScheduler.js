const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generates a random date within the next 2 months from today
 */
function getRandomFutureDate() {
    const today = new Date();
    const twoMonthsInMs = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
    const randomOffset = Math.floor(Math.random() * twoMonthsInMs);
    return new Date(today.getTime() + randomOffset);
}

/**
 * Updates past events with new random future dates
 */
async function updatePastEvents() {
    try {
        const now = new Date();

        // Find all events that have passed
        const pastEvents = await prisma.event.findMany({
            where: {
                date: {
                    lt: now
                }
            }
        });

        if (pastEvents.length === 0) {
            console.log('[Event Scheduler] No past events to update');
            return 0;
        }

        console.log(`[Event Scheduler] Updating ${pastEvents.length} past event(s)...`);

        // Update each past event with a new random date
        let updatedCount = 0;
        for (const event of pastEvents) {
            const newDate = getRandomFutureDate();

            await prisma.event.update({
                where: { id: event.id },
                data: { date: newDate }
            });

            console.log(`[Event Scheduler] Updated "${event.title}" to ${newDate.toLocaleDateString()}`);
            updatedCount++;
        }

        return updatedCount;
    } catch (error) {
        console.error('[Event Scheduler] Error updating past events:', error);
        throw error;
    }
}

/**
 * Starts the event scheduler to check and update past events periodically
 * @param {number} intervalHours - How often to check (in hours)
 */
function startEventScheduler(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    console.log(`[Event Scheduler] Started - checking every ${intervalHours} hour(s)`);

    // Run immediately on start
    updatePastEvents().catch(err => {
        console.error('[Event Scheduler] Initial update failed:', err);
    });

    // Then run periodically
    setInterval(() => {
        updatePastEvents().catch(err => {
            console.error('[Event Scheduler] Scheduled update failed:', err);
        });
    }, intervalMs);
}

module.exports = {
    startEventScheduler,
    updatePastEvents,
    getRandomFutureDate
};
