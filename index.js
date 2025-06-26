import express from"express";import axios from"axios";\
const app=express();app.use(express.json());app.post("/tts",async(r,s)=>{
  const{voice_id,text,voice_settings}=r.body;
  const {data}=await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
    {text,voice_settings},
    {headers:{ "xi-api-key":process.env.ELEVEN_API_KEY,
               accept:"audio/mpeg","Content-Type":"application/json"},
     responseType:"arraybuffer"});
  s.set("Content-Type","audio/mpeg").send(data);
});export default app;
