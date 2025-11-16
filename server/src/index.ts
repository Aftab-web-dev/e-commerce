import dotenv from "dotenv";
import { app } from "./app";
import connectDB from "./db/index";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(` Server is running at Port : ${process.env.PORT}`);
    })
})

.catch((error) => {
    console.log("MONGO db connection failed !!!", error);
})