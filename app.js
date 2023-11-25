const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const URI = process.env.MONGO_URI;

// const URI = 'mongodb://localhost:27017';
const client = new MongoClient(URI);

app.post('/create', async (req, res) => {
    try {
        await client.connect();
        const { task_name, description, status, due_date } = req.body;
        const db = client.db('Assignment_4');
        const collection = db.collection('tasks');
        const result = await collection.findOne({ task_name });
        if(result) {
            res.json({ success: false, message: "Already exists" });
        }
        else {
            await collection.insertOne({
                task_name: task_name, 
                description: description, 
                status: status, 
                due_date: due_date
            });
            res.json({ success: true, message: "Task created successfully"});
        }
    }
    catch(err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    finally {
        if(client)
            await client.close();
    }
});

app.get('/read', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('Assignment_4');
        const collection = db.collection('tasks');
        
        list = await collection.find().toArray();
        // for(let i = 0; i < list.length; i++) {
        //     list[i] = JSON.stringify(list[i]);
        // }
        res.json({
            success: true,
            message: "Read successfully",
            arrayData: list
        });
    }
    catch(err) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    finally {
        if(client)
            await client.close();
    }
});

app.post('/update', async (req, res) => {
    try {
        await client.connect();
        const details = req.body;
        const db = client.db('Assignment_4');
        const collection = db.collection('tasks');
        const filter = {
            task_name: details.task_name
        };
        const result = await collection.findOne(filter);
        if(!result) {
            res.json({ success: false, message: "The task does not exist", task_: result });
        }
        else {
            const temp = {
                $set: {
                    task_name: details.task_name, 
                    description: details.description, 
                    status: details.status, 
                    due_date: details.due_date
                }
            }
            await collection.updateOne(filter, temp);
            res.json({ success: true, message: "Task updated successfully" });
        }
    }
    catch(err) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: err });
    }
    finally {
        if(client)
            await client.close();
    }
});

if(client)
    client.close();

app.listen(port);