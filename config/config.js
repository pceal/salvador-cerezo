import mongoose from 'mongoose';

const dbConnection = async () => {
  try {
    // Verificar si la URI está disponible antes de intentar conectar
    if (!process.env.MONGO_URI) {
        throw new Error('La variable de entorno MONGO_URI no está definida.');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Conectado a MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Error de conexión a MongoDB: ${err.message}`);
    process.exit(1);
  }
};

export { dbConnection };