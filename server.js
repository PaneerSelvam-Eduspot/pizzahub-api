const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DB_PATH = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(cors());
function readDB() {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}


// GET
app.get('/api/pizzahub', (req,res) => {
    const db = readDB();
    res.json(db.pizzahub);
});

app.get('/api/pizzahub/:id', (req,res) => {
    const { id } = req.params;
    const db = readDB();


    const hub = db.pizzahub.find(h => h.id === id);
    if (!hub) {
        return res.status(404).json({ message: 'PizzaHub not found' });
    }

    res.json(hub);
});

app.get('/api/pizzas', (req, res) => {
  const db = readDB();
  res.json(db.pizzas);
});

app.get('/api/pizzahub/:shopId/pizzas', (req, res) => {
  const { shopId } = req.params;
  const db = readDB();

  const pizzas = db.pizzas.filter(p => p.shopId === shopId);

  res.json(pizzas);
});

app.get('/api/pizzas/:pizzaId/beverages', (req, res) => {
  const { pizzaId } = req.params;
  const db = readDB();

  const beverages = db.beverages.filter(b => b.pizzaId === pizzaId);
  res.json(beverages);
});



// POST
app.post('/api/pizzahub/:shopId/pizzas', (req, res) => {
    const { shopId } = req.params;
    const { type, name } = req.body;


    if (!type || !name) {
        return res.status(400).json({ message: 'type and name are requires' })
    }

    const db = readDB();

    const newPizza = {
        id: `p${Date.now()}`,
        shopId,
        type,
        name
    };

    db.pizzas.push(newPizza);
    writeDB(db);

    res.status(201).json(newPizza);
});

app.post('/api/pizzas/:pizzaId/beverages', (req, res) => {
  const { pizzaId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Beverage name required' });
  }

  const db = readDB();

  const beverage = {
    id: `b${Date.now()}`,
    pizzaId,
    name
  };

  db.beverages.push(beverage);
  writeDB(db);

  res.status(201).json(beverage);
});


// PATCH

app.patch('/api/pizzas/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const db = readDB();
    const pizza = db.pizzas.find(p => p.id === id);

    if(!pizza) {
        return res.status(404).json({ message: 'Pizza not found' })
    }

    Object.assign(pizza, updates);
    writeDB(db);


    res.json({
        message: 'Pizza updated successfully',
        pizza
    });
});


// DELETE

app.delete('/api/pizzas/:id', (req, res) => {
    const { id } = req.params;

    const db = readDB();
    const initialLength = db.pizzas.length;

    db.pizzas = db.pizzas.filter(p => p.id !== id);

    if (db.pizzas.length === initialLength) {
        return res.status(404).json({ message: 'Pizza not found ' })
    }

    writeDB(db);
    res.json({ message: `Pizza ${id} deleted` })
});

// Orders

app.post('/api/orders', (req, res) => {
    const { pizzaId, quantity } = req.body;
    const quantityNum = Number(quantity);
    
    if (!pizzaId || Number.isNaN(quantityNum)) {
        return res.status(400).json({ 
         message: 'PizzaId and nuumeric quantity are required' 
        });
    }

    const db = readDB();
    
    const order = {
        id: `o${Date.now()}`,
        pizzaId,
        quantity,
        status: 'placed'
    };

    db.orders.push(order);
    writeDB(db);

    res.status(201).json(order);
});


app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    const db = readDB();
    const order = db.orders.find(o => o.id === id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }


    order.status = status;
    writeDB(db);

    res.json({
        message: 'Order status updated',
        order
    });
});

app.listen(
    PORT,
    () => console.log(`It' alive on ${PORT}`)
)

