const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require('cors')

const socketController = require("./controllers/socketController");
const { generateRoomCode } = require("./utilities/roomStore");const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const rooms = require('./utilities/roomStore')
const loginRoute = require('./routes/userLogin')
const getAllUsersRoute = require('./routes/userGetAllUsers')
const registerRoute = require('./routes/userSignUp')
const getUserByIdRoute = require('./routes/userGetUserById')
const dbConnection = require('./config/db.config')
const editUser = require('./routes/userEditUser')
const deleteUser = require('./routes/userDeleteAll')
const newQuestionRoute = require('./routes/questionCreate')
const getAllQuestionsRoute = require('./routes/questionGetAllQuestions')
const editQuestionRoute = require('./routes/questionEditQuestion')
const getQuestionByIdRoute = require('./routes/questionGetQuestionById')
const deleteQuestion = require('./routes/questionDeleteAll')
const deleteQID = require('./routes/questionDeleteID')
const getQuestionByQuestionRoute = require('./routes/questionGetQuestionByQuestion')
const userAddXp = require("./routes/userAddXp");
const userGetLevels = require("./routes/userGetLevels");
const deleteUID = require("./routes/userDeleteID");
const profileImageUpload = require("./routes/profileImageUpload");
const DeletePiID = require("./routes/profileImageDeleteID");
const GetAllProfileImage = require("./routes/profileImageGetAll");
const openTriviaDBquestionGetter = require("./routes/openTriviaDBquestionGetter");
const userUpdatePassword = require("./routes/userUpdatePassword");
const userDeleteAccount = require("./routes/userDeleteAccount");



require('dotenv').config();
const SERVER_PORT = 8081

dbConnection()

app.get("/", (req, res) => {
    res.send("Server Running!")
});
app.use(cors({origin: '*'}))
app.use(express.json())
app.use("/api", openTriviaDBquestionGetter);
app.use('/user', loginRoute)
app.use('/user', registerRoute)
app.use('/user', getAllUsersRoute)
app.use('/user', getUserByIdRoute)
app.use('/user', editUser)
app.use('/user', deleteUser)
app.use('/user', deleteUID)
app.use('/question', newQuestionRoute)
app.use('/question', getAllQuestionsRoute)
app.use('/question', editQuestionRoute)
app.use('/question', getQuestionByIdRoute)
app.use('/question', getQuestionByQuestionRoute)
app.use('/question', deleteQuestion)
app.use('/question', deleteQID)
app.use('/user', userAddXp)
app.use('/user', userGetLevels)
app.use('/user', profileImageUpload)
app.use('/profileImage', DeletePiID) // Needs to be tested
app.use('/profileImage', GetAllProfileImage)
app.use('/user', userUpdatePassword);
app.use('/user', userDeleteAccount);

socketController(io, rooms, generateRoomCode);

server.listen(SERVER_PORT, () => {
    console.log(`The backend service is running on port ${SERVER_PORT} and waiting for requests.`);
});
