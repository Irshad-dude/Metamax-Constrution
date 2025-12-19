
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let useMongo = true;
// Check if mongoose is connected
if (mongoose.connection.readyState === 0) {
    useMongo = false;
}

// --- In-Memory Store (Fallback) ---
const memoryStore = {
    users: [],
    projects: [],
    sectors: [],
    contacts: []
};

// --- User Schema ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Schemas ---
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
});

const sectorSchema = new mongoose.Schema({
    id: String,
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    image: String,
    isVisible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    topic: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// --- Hybrid Model Factory ---
const createModel = (name, schema, storeKey) => {
    const MongooseModel = mongoose.model(name, schema);

    // Mock Class for In-Memory Fallback
    class MockDocument {
        constructor(data) {
            Object.assign(this, data);
            if (!this._id) this._id = Date.now().toString();
        }

        async save() {
            // Simulate Password Hashing for User
            if (name === 'User') {
                // Check if raw password exists and needs hashing (basic check)
                if (this.password && !this.password.startsWith('$2a$')) {
                    const salt = await bcrypt.genSalt(10);
                    this.password = await bcrypt.hash(this.password, salt);
                }
            }

            memoryStore[storeKey].push(this);
            return { ...this, _doc: this, id: this._id };
        }

        async matchPassword(enteredPassword) {
            return await bcrypt.compare(enteredPassword, this.password);
        }

        async deleteOne() {
            memoryStore[storeKey] = memoryStore[storeKey].filter(i => i._id.toString() !== this._id.toString());
        }
    }

    // Interactive Proxy to switch between Mongoose and Mock
    const HybridModel = function (data) {
        if (mongoose.connection.readyState === 1) {
            return new MongooseModel(data);
        }
        return new MockDocument(data);
    };

    // Static Methods
    HybridModel.find = (query = {}) => {
        if (mongoose.connection.readyState === 1) return MongooseModel.find(query);

        // Return Chainable Mock Query
        return {
            sort: function () { return this; }, // Ignore sort details, just return self
            then: function (resolve, reject) {
                // Default Memory Sort: Newest First
                const results = memoryStore[storeKey].map(i => ({
                    ...i,
                    _doc: i,
                    id: i._id,
                    deleteOne: async () => { memoryStore[storeKey] = memoryStore[storeKey].filter(x => x._id !== i._id) }
                })).reverse();
                return Promise.resolve(results).then(resolve, reject);
            }
        };
    };

    HybridModel.findOne = async (query) => {
        if (mongoose.connection.readyState === 1) return MongooseModel.findOne(query);
        const key = Object.keys(query)[0];
        const val = query[key];
        const item = memoryStore[storeKey].find(i => i[key] === val);
        if (!item) return null;
        const doc = new MockDocument(item); // Re-wrap to get methods
        return doc;
    };

    HybridModel.findById = async (id) => {
        if (mongoose.connection.readyState === 1) return MongooseModel.findById(id);
        const item = memoryStore[storeKey].find(i => i._id.toString() === id.toString());
        if (!item) return null;
        return new MockDocument(item);
    };

    HybridModel.countDocuments = async () => {
        if (mongoose.connection.readyState === 1) return MongooseModel.countDocuments();
        return memoryStore[storeKey].length;
    };

    // Support .create() just in case
    HybridModel.create = async (data) => {
        const doc = new HybridModel(data);
        return await doc.save();
    };

    return HybridModel;
};

const User = createModel('User', userSchema, 'users');
const Project = createModel('Project', projectSchema, 'projects');
const Sector = createModel('Sector', sectorSchema, 'sectors');
const Contact = createModel('Contact', contactSchema, 'contacts');

module.exports = { User, Project, Sector, Contact };
