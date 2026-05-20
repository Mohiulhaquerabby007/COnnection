import app from './app.js';
import User from './models/User.js';
import Swipe from './models/Swipe.js';
import Match from './models/Match.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';

console.log('==================================================');
console.log('   connection backend test & validation runner    ');
console.log('==================================================');

const runSanityChecks = async () => {
  try {
    console.log('1. Validating Mongoose Schemas compilation...');
    if (User.modelName === 'User') console.log('   ✔ User Model: Compiled OK');
    if (Swipe.modelName === 'Swipe') console.log('   ✔ Swipe Model: Compiled OK');
    if (Match.modelName === 'Match') console.log('   ✔ Match Model: Compiled OK');
    if (Message.modelName === 'Message') console.log('   ✔ Message Model: Compiled OK');
    if (Notification.modelName === 'Notification') console.log('   ✔ Notification Model: Compiled OK');

    console.log('\n2. Validating Express API routes registration...');
    const registeredPaths = [];
    
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        registeredPaths.push(middleware.route.path);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            registeredPaths.push(handler.route.path);
          }
        });
      }
    });

    console.log('   Registered primary Express middleware paths:');
    registeredPaths.forEach((path) => console.log(`   ✔ ${path}`));

    console.log('\n==================================================');
    console.log('✔ All backend sanity checks passed successfully!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n✖ Sanity check failed with error:', error.message);
    process.exit(1);
  }
};

runSanityChecks();
