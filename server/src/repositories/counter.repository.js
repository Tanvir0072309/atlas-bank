import Counter from "../models/counter.model.js";

class CounterRepository {
    async getNextSequence(name) {
        const counter = await Counter.findOneAndUpdate(
            { name },
            {
                $inc: {
                    sequence: 1,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

        return counter.sequence;
    }
}

export default new CounterRepository();