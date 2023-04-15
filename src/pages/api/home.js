import api from '../../services/axios';

export default async function handler(req, res) {
  try {
    const { data } = await api.get('/api/home');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
