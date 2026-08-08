require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/users/models/User');
const Association = require('./src/modules/associations/models/Association');
const Flat = require('./src/modules/associations/models/Flat');
const { ROLES, MEMBERSHIP_STATUS } = require('./src/utils/constants');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4
    });
    console.log('MongoDB Connected for Seeding...');

    // Drop the problematic phantom index if it exists from previous iterations
    try {
      await mongoose.connection.collection('users').dropIndex('phone_1');
      console.log('Dropped phantom phone_1 index');
    } catch (err) {
      // Ignore if index doesn't exist
    }

    await User.deleteMany({ email: { $in: ['superadmin@livemitra.com', 'admin@livemitra.com', 'resident@livemitra.com', 'employee@livemitra.com'] }});

    const sa = new User({
      fullName: 'Super Admin',
      email: 'superadmin@livemitra.com',
      password: 'password123',
      phone: '9999999999',
      isSuperAdmin: true
    });
    await sa.save();

    // 2. Create a dummy Association
    let assoc = await Association.findOne({ name: 'LiveMitra Grand' });
    if (!assoc) {
      assoc = await Association.create({
        name: 'LiveMitra Grand',
        address: '123 Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001'
      });
    }

    // 3. Create a dummy Flat
    let flat = await Flat.findOne({ associationId: assoc._id, blockName: 'A', flatNumber: '101' });
    if (!flat) {
      flat = await Flat.create({
        associationId: assoc._id,
        blockName: 'A',
        flatNumber: '101'
      });
    }

    // 4. Create Association Admin
    const admin = new User({
      fullName: 'Association Admin',
      email: 'admin@livemitra.com',
      password: 'password123',
      phone: '8888888888',
      memberships: [{
        associationId: assoc._id,
        role: ROLES.ASSOCIATION_ADMIN,
        status: MEMBERSHIP_STATUS.ACTIVE
      }]
    });
    await admin.save();

    // 5. Create Resident
    const resident = new User({
      fullName: 'Resident User',
      email: 'resident@livemitra.com',
      password: 'password123',
      phone: '7777777777',
      memberships: [{
        associationId: assoc._id,
        role: ROLES.RESIDENT,
        status: MEMBERSHIP_STATUS.ACTIVE,
        unitNumber: 'A-101'
      }]
    });
    await resident.save();

    // 6. Create Employee (Gatekeeper)
    const employee = new User({
      fullName: 'Gatekeeper Employee',
      email: 'employee@livemitra.com',
      password: 'password123',
      phone: '6666666666',
      memberships: [{
        associationId: assoc._id,
        role: ROLES.EMPLOYEE,
        status: MEMBERSHIP_STATUS.ACTIVE
      }]
    });
    await employee.save();

    console.log('Seeding Complete! You can now log in with the following accounts:');
    console.log('--------------------------------------------------');
    console.log('Super Admin:   superadmin@livemitra.com / password123');
    console.log('Assoc Admin:   admin@livemitra.com      / password123');
    console.log('Resident:      resident@livemitra.com   / password123');
    console.log('Employee:      employee@livemitra.com   / password123');
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
