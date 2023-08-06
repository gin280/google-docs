const mongoose = require("mongoose");
const Document = require("./Document");

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.emit("load-history", document.history);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      const newTimestamp = new Date();
      const document = await Document.findById(documentId);

      // 更新当前的 data 字段
      document.data = data;

      // 然后处理历史记录
      const lastHistory = document.history[document.history.length - 1];
      if (
        false
      ) {
        // 60*1000 ms = 1 minute
        /**lastHistory &&
        newTimestamp - new Date(lastHistory.timestamp) < 60 * 1000 */
        lastHistory.data = data;
        lastHistory.timestamp = newTimestamp;
      } else {
        document.history.push({
          data,
          timestamp: newTimestamp,
        });
      }
      await document.save();
      socket.emit("load-history", document.history);
    });

    socket.emit("get-history", async (documentId) => {
      const document = await Document.findById(documentId);
      socket.emit("load-history", document.history);
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
