const JsonDB = require('../utils/jsonDB');

class JsonModel {
    constructor(filename) {
        this.db = new JsonDB(filename);
    }

    async find(query = {}) {
        const data = this.db.getAll();
        if (Object.keys(query).length === 0) return data;

        return data.filter(item => {
            return Object.entries(query).every(([key, value]) => item[key] == value);
        });
    }

    async findOne(query) {
        const results = await this.find(query);
        return results[0] || null;
    }

    async findById(id) {
        return this.db.getById(id.toString());
    }

    async findByIdAndUpdate(id, updates, options = {}) {
        return this.db.update(id.toString(), updates);
    }

    async findByIdAndDelete(id) {
        const item = await this.findById(id);
        if (item) {
            this.db.delete(id.toString());
            return item;
        }
        return null;
    }

    async findOneAndUpdate(query, updates, options = {}) {
        console.log('[JSON_ADAPTER] findOneAndUpdate called');
        console.log('[JSON_ADAPTER] Query:', JSON.stringify(query));

        let item = await this.findOne(query);

        if (item) {
            console.log('[JSON_ADAPTER] Found existing item:', item._id);
            // Update existing
            const updatedItem = { ...item, ...updates, lastUpdated: new Date().toISOString() };
            const result = await this.db.update(item.id || item._id, updatedItem);
            console.log('[JSON_ADAPTER] Update existing result:', result ? 'Success' : 'Failed');
            return updatedItem;
        } else if (options.upsert) {
            console.log('[JSON_ADAPTER] Item not found. Upserting...');
            // Create New
            const newItem = { ...query, ...updates, lastUpdated: new Date().toISOString() };
            const created = await this.create(newItem);
            console.log('[JSON_ADAPTER] Created new item:', created);
            return created;
        }
        return null;
    }

    async create(data) {
        // Handle Mongoose-style object creation
        const item = Array.isArray(data) ? data[0] : data;
        return this.db.create(item);
    }

    async deleteMany(query = {}) {
        if (Object.keys(query).length === 0) {
            this.db.write([]);
            return { deletedCount: 'all' };
        }
        // Basic filtering for deleteMany if needed later
        return { deletedCount: 0 };
    }
}

// Wrap models to support .populate() etc. with no-ops or simple logic
const createMockModel = (filename) => {
    const model = new JsonModel(filename);

    // Proxy to handle .populate(), .select(), .sort() etc which return 'this' in Mongoose
    return new Proxy(model, {
        get(target, prop) {
            if (prop === 'populate' || prop === 'select' || prop === 'sort') {
                return function () {
                    // Return a promise that resolves to the data if it's the end of the chain
                    // or the proxy itself if it's being chained.
                    // For simplicity, we'll just mock the common usage: result = await Model.find().populate()
                    const originalMethod = target[prop];
                    if (typeof originalMethod === 'function') {
                        return originalMethod.apply(target, arguments);
                    }
                    return this; // Chainable no-op
                };
            }
            return target[prop];
        }
    });
};

module.exports = {
    User: createMockModel('users.json'),
    Product: createMockModel('products.json'),
    Purchase: createMockModel('orders.json'), // Reusing orders for purchases for now
    Order: createMockModel('orders.json'),
    UserProgress: createMockModel('progress.json')
};
