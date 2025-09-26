
import express from "express";
import dotenv from "dotenv";
import prisma from "./db.js"; 
import { Prisma } from "@prisma/client";


dotenv.config();


const app = express();


app.use(express.json());


app.get("/", (_req, res) => res.json({ ok: true, service: "API 3º Bimestre" }));


app.post("/usuarios", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const novoUsuario = await prisma.user.create({
      data: { name, email, password }
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "E-mail já feito meu patrão" });
    }

    res.status(500).json({ error: "deu erro" });
  }
});


app.get("/usuarios", async (_req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      orderBy: { id: "asc" }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar os coiso" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


app.get("/usuarios/:id", async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get("/status", (req, res) => {
  res.json({ message: "API Online" });
});

app.post('/stores', async (req, res) => {
  try {
    const { name, userId } = req.body

    
    const existingStore = await prisma.store.findUnique({
      where: { userId: Number(userId) }
    })
    if (existingStore) {
      return res.status(400).json({ error: 'Este usuário já possui uma loja.' })
    }

    const store = await prisma.store.create({
      data: {
        name,
        userId: Number(userId)
      }
    })

    res.status(201).json(store)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.get('/stores/:id', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        products: true
      }
    })

    if (!store) {
      return res.status(404).json({ error: 'Loja não encontrada' })
    }

    res.json(store)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.put('/stores/:id', async (req, res) => {
  try {
    const { name, userId } = req.body

    const store = await prisma.store.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(userId && { userId: Number(userId) })
      }
    })

    res.json(store)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.delete('/stores/:id', async (req, res) => {
  try {
    await prisma.store.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(204).send()
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})




app.post('/products', async (req, res) => {
  try {
    const { name, price, storeId } = req.body

    const product = await prisma.product.create({
      data: {
        name,
        price: new Prisma.Decimal(price), 
        storeId: Number(storeId)
      }
    })

    res.status(201).json(product)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        store: {
          include: {
            user: true
          }
        }
      }
    })

    res.json(products)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        store: {
          include: {
            user: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, storeId } = req.body

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
        ...(storeId && { storeId: Number(storeId) })
      }
    })

    res.json(product)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})


app.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(204).send()
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const usuario = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password })
      }
    });
    res.json(usuario);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(400).json({ error: error.message });
  }
});


app.delete("/usuarios/:id", async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(400).json({ error: error.message });
  }
});
