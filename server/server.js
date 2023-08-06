const mongoose = require("mongoose");
const Document = require("./Document");
const Template = require("./Template");
const _ = require("lodash");

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
  socket.on("save-as-template", async (templateId, content, callback) => {
    try {
      const newTemplate = new Template({
        _id: templateId,
        data: content
      });
      await newTemplate.save();
      callback(true); // 通知客户端保存成功
    } catch (error) {
      console.error(error);
      callback(false); // 通知客户端保存失败
    }
  });

  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.emit("load-history", document.history);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async ({ data, html }, callback) => {
      // 添加 callback 参数
      // 更新文档数据
      await Document.findByIdAndUpdate(documentId, { data, html });

      // 调用回调通知客户端文档已保存
      callback();

      // 获取更新后的文档
      const updatedDocument = await Document.findById(documentId);

      const lastHistory = document.history[document.history.length - 1];
      // 判断是否有变化
      if (lastHistory && !_.isEqual(lastHistory.data, updatedDocument.data)) {
        document.history.push({
          data: updatedDocument.data,
          html: updatedDocument.html,
          timestamp: new Date().getTime(),
        });
        await document.save();
        console.info("save history");
        socket.emit("load-history", document.history);
      } else if (!lastHistory) {
        // 如果没有历史记录，创建一个新的历史记录
        document.history.push({
          data: updatedDocument.data,
          html: updatedDocument.html,
          timestamp: new Date().getTime(),
        });
        await document.save();
        console.info("save history");
        socket.emit("load-history", document.history);
      }
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({
    _id: id,
    data: defaultValue,
    html: defaultValue,
  });
}
