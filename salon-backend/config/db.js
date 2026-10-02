import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('⚠️ MONGODB_URI no configurada. El servidor arrancará sin conexión a MongoDB.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    console.log('⚠️ La API continuará ejecutándose sin MongoDB por ahora.');
  }
};
