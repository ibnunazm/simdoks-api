"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.updateTask =
  exports.searchTask =
  exports.getTasks =
  exports.getTaskById =
  exports.filterByYears =
  exports.deleteTask =
  exports.createTask =
  exports.autoDeleteTask =
    void 0;
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _TaskModel = _interopRequireDefault(require("../models/TaskModel.js"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const getTasks = async (req, res) => {
  try {
    const tasks = await _TaskModel.default.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
  try {
    const task = await _TaskModel.default.findByPk(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
  try {
    const { nama, startDate } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _TaskModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    const fileUrl = "file/tasks/".concat(nama).concat(fileExt);
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearsLater = new Date(date);
    fiveYearsLater.setFullYear(date.getFullYear() + 5);
    if (fiveYearsLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _TaskModel.default.create({
      categoriesId: 7,
      file_name: nama + fileExt,
      start_date: date,
      file_url: fileUrl,
      end_date: fiveYearsLater,
    });
    file.mv("./public/file/tasks/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/tasks/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/tasks/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Task created successfully");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
  try {
    const { nama, startDate } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _TaskModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(file.name).toLowerCase();
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    const fileUrl = "file/tasks/".concat(nama).concat(fileExt);
    const previousTasks = await _TaskModel.default.findByPk(req.params.id);
    if (previousTasks) {
      const previousFileUrl = "./public/".concat(previousTasks.file_url);
      if (_fs.default.existsSync(previousFileUrl)) {
        _fs.default.unlinkSync(previousFileUrl);
      }
    }
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearsLater = new Date(date);
    fiveYearsLater.setFullYear(date.getFullYear() + 5);
    if (fiveYearsLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _TaskModel.default.update(
      {
        categoriesId: 7,
        file_name: nama + fileExt,
        start_date: date,
        file_url: fileUrl,
        end_date: fiveYearsLater,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    file.mv("./public/file/tasks/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/tasks/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/tasks/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Task updated successfully");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
  try {
    const task = await _TaskModel.default.findByPk(req.params.id);
    const filePath = "./public/".concat(task.file_url);
    if (_fs.default.existsSync(filePath)) {
      _fs.default.unlinkSync(filePath);
    }
    await _TaskModel.default.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json("Task deleted successfully");
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteTask = deleteTask;
const searchTask = async (req, res) => {
  try {
    const { search } = req.query;
    const tasks = await _TaskModel.default.findAll({
      where: {
        file_name: {
          [_sequelize.Op.like]: "%".concat(search, "%"),
        },
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchTask = searchTask;
const filterByYears = async (req, res) => {
  try {
    const { years } = req.query;
    const startDate = "".concat(years, "-01-01");
    const endDate = "".concat(parseInt(years) + 1, "-01-01");
    const tasks = await _TaskModel.default.findAll({
      where: {
        start_date: {
          [_sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const autoDeleteTask = async () => {
  try {
    const expiredTasks = await _TaskModel.default.findAll({
      where: {
        end_date: {
          [_sequelize.Op.lt]: new Date(),
        },
      },
    });
    await Promise.all(
      expiredTasks.map(async (task) => {
        const filePath = _path.default.join("public/", task.file_url);
        await task.destroy();
        _fs.default.unlinkSync(filePath);
      })
    );
    console.log("Pengecekan dan penghapusan berhasil dilakukan.");
  } catch (error) {
    console.error("Gagal melakukan pengecekan dan penghapusan:", error);
  }
};
exports.autoDeleteTask = autoDeleteTask;

const renameTasks = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_task = await _TaskModel.default.findByPk(id);

    if (!old_task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _TaskModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(old_task.file_name).toLowerCase();
    const fileUrl = `file/tasks/${nama}${fileExt}`;
    const isDuplicateName = existingFiles.some(
      (existingFile) =>
        existingFile.file_name === "".concat(nama).concat(fileExt)
    );
    if (isDuplicateName) {
      return res
        .status(400)
        .json(
          "Nama file sudah terdapat dalam database gunakan nama file yang berbeda."
        );
    }
    // Ubah nama file di database
    await _TaskModel.default.update(
      {
        file_name: `${nama}${fileExt}`,
        file_url: fileUrl,
      },
      {
        where: { id: id },
      }
    );

    // Ubah nama file di direktori publik
    const oldFilePath = _path.default.join(
      __dirname,
      "..",
      "public",
      old_task.file_url
    );
    const newFilePath = _path.default.join(__dirname, "..", "public", fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/tasks/${nama}${fileExt}`
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);

      const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
      const { width, height } = page.getSize();
      const qrCodeWidth = 56;
      const qrCodeHeight = 56;
      const x = width - qrCodeWidth - 7;
      const y = height - qrCodeHeight - 7;

      page.drawImage(qrCodeImage, {
        x,
        y,
        width: qrCodeWidth,
        height: qrCodeHeight,
      });

      page.drawRectangle({
        x: x - 1,
        y: y - 1,
        width: qrCodeWidth + 2,
        height: qrCodeHeight + 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      const pdfBytes = await pdfDoc.save();
      _fs.default.writeFileSync(
        `./public/file/tasks/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Task berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renameTasks = renameTasks;
