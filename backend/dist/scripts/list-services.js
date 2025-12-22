"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const services = await prisma.service.findMany({
            select: {
                id: true,
                name: true
            }
        });
        console.log('--- AVAILABLE SERVICES ---');
        if (services.length === 0) {
            console.log('No services found in the database.');
        }
        else {
            console.table(services);
        }
        console.log('--------------------------');
    }
    catch (err) {
        console.error('Error fetching services:', err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
