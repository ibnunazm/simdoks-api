"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.updateItem =
  exports.searchItem =
  exports.getItemsBySubtypeId =
  exports.getItems =
  exports.getItemById =
  exports.filterByYears =
  exports.deleteItem =
  exports.createItem =
  exports.autoDeleteItem =
    void 0;
require("core-js/modules/es.promise.js");
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
var _ItemModel = _interopRequireDefault(require("../models/ItemModel.js"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
var _sequelize = require("sequelize");
var { PDFDocument, rgb } = require("pdf-lib");
var QRCode = require("qrcode");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const getItems = async (req, res) => {
  try {
    const Item = await _ItemModel.default.findAll();
    res.status(200).json(Item);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getItems = getItems;
const getItemById = async (req, res) => {
  try {
    const item = await _ItemModel.default.findByPk(req.params.id);
    res.status(200).json(item);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getItemById = getItemById;
const createItem = async (req, res) => {
  try {
    const { nama, typeId, subtypeId, startDate } = req.body;
    const file = req.files.file;
    if (nama === "" || typeId === "" || startDate === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _ItemModel.default.findAll({
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
    const fileUrl = "file/items/".concat(nama).concat(fileExt);
    const date = new Date(startDate);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    const fiveYearsLater = new Date(date);
    fiveYearsLater.setFullYear(date.getFullYear() + 5);
    if (fiveYearsLater < new Date()) {
      return res.status(400).json("End date must be greater than current date");
    }
    await _ItemModel.default.create({
      categoriesId: 3,
      typeId: typeId,
      subtypeId: subtypeId,
      file_name: nama + fileExt,
      file_url: fileUrl,
      start_date: date,
      end_date: fiveYearsLater,
    });
    await file.mv("./public/file/items/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/items/${nama}${fileExt}`
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
        `./public/file/items/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(201).json("Item berhasil ditambahkan");
  } catch (error) {
    console.log(error.message);
  }
};
exports.createItem = createItem;
const updateItem = async (req, res) => {
  try {
    const { nama, startDate, typeId, subtypeId } = req.body;
    const file = req.files.file;
    if (nama === "" || startDate === "" || typeId === "") {
      return res.status(400).json("Semua field harus diisi");
    }
    const existingFiles = await _ItemModel.default.findAll({
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
    const fileUrl = "file/items/".concat(nama).concat(fileExt);
    const previousItems = await _ItemModel.default.findByPk(req.params.id);
    if (previousItems) {
      const previousFileUrl = "./public/".concat(previousItems.file_url);
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
    await _ItemModel.default.update(
      {
        categoriesId: 3,
        typeId: typeId,
        subtypeId: subtypeId,
        file_name: nama + fileExt,
        file_url: fileUrl,
        start_date: date,
        end_date: fiveYearsLater,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await file.mv("./public/file/items/".concat(nama).concat(fileExt));
    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/items/${nama}${fileExt}`
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
        `./public/file/items/${nama}${fileExt}`,
        pdfBytes
      );
    }
    res.status(200).json("Item berhasil diupdate");
  } catch (error) {
    console.log(error.message);
  }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
  try {
    const item = await _ItemModel.default.findByPk(req.params.id);
    const fileUrl = "./public/".concat(item.file_url);
    if (_fs.default.existsSync(fileUrl)) {
      _fs.default.unlinkSync(fileUrl);
    }
    await _ItemModel.default.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json("Item berhasil dihapus");
  } catch (error) {
    console.log(error.message);
  }
};
exports.deleteItem = deleteItem;
const getItemsBySubtypeId = async (req, res) => {
  try {
    const { subtypeId, typeId } = req.body;
    let items = "";
    if (subTypeId) {
      items = await _ItemModel.default.findAll({
        where: {
          subtypeId: subtypeId,
          typeId: typeId,
        },
      });
    } else {
      items = await _ItemModel.default.findAll({
        where: {
          typeId: typeId,
        },
      });
    }
    res.status(200).json(items);
  } catch (error) {
    console.log(error.message);
  }
};
exports.getItemsBySubtypeId = getItemsBySubtypeId;
const filterByYears = async (req, res) => {
  try {
    const { typeId, subtypeId, years } = req.query;
    let items = "";
    if (subtypeId) {
      items = await _ItemModel.default.findAll({
        where: {
          typeId: typeId,
          subtypeId: subtypeId,
          start_date: {
            [_sequelize.Op.between]: [
              "".concat(years, "-01-01"),
              "".concat(years, "-12-31"),
            ],
          },
        },
      });
    } else {
      items = await _ItemModel.default.findAll({
        where: {
          typeId: typeId,
          start_date: {
            [_sequelize.Op.between]: [
              "".concat(years, "-01-01"),
              "".concat(years, "-12-31"),
            ],
          },
        },
      });
    }
    res.status(200).json(items);
  } catch (error) {
    console.log(error.message);
  }
};
exports.filterByYears = filterByYears;
const searchItem = async (req, res) => {
  try {
    const { search, typeId, subtypeId } = req.query;
    let items = "";
    if (subtypeId) {
      items = await _ItemModel.default.findAll({
        where: {
          file_name: {
            [_sequelize.Op.like]: "%".concat(search, "%"),
          },
          typeId: typeId,
          subtypeId: subtypeId,
        },
      });
    } else {
      items = await _ItemModel.default.findAll({
        where: {
          file_name: {
            [_sequelize.Op.like]: "%".concat(search, "%"),
          },
          typeId: typeId,
        },
      });
    }
    res.status(200).json(items);
  } catch (error) {
    console.log(error.message);
  }
};
exports.searchItem = searchItem;
const autoDeleteItem = async () => {
  try {
    const expiredItems = await _ItemModel.default.findAll({
      where: {
        end_date: {
          [_sequelize.Op.lt]: new Date(),
        },
      },
    });
    await Promise.all(
      expiredItems.map(async (item) => {
        const filePath = _path.default.join("public/", item.file_url);
        await item.destroy();
        _fs.default.unlinkSync(filePath);
      })
    );
    console.log("Pengecekan dan penghapusan berhasil dilakukan.");
  } catch (error) {
    console.error("Gagal melakukan pengecekan dan penghapusan:", error);
  }
};
exports.autoDeleteItem = autoDeleteItem;

const renameItems = async (req, res) => {
  try {
    const { id, nama } = req.query;
    const old_item = await _ItemModel.default.findByPk(id);

    if (!old_item) {
      return res.status(404).json({ error: "Item not found" });
    }
    if (!nama) {
      return res.status(400).json({ error: "Nama tidak boleh kosong" });
    }
    const existingFiles = await _ItemModel.default.findAll({
      attributes: ["file_name"],
    });
    const fileExt = _path.default.extname(old_item.file_name).toLowerCase();
    const fileUrl = `file/items/${nama}${fileExt}`;
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
    await _ItemModel.default.update(
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
      old_item.file_url
    );
    const newFilePath = _path.default.join(__dirname, "..", "public", fileUrl);
    _fs.default.renameSync(oldFilePath, newFilePath);

    if (fileExt === ".pdf") {
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://api.simdoks.web.id/${fileUrl}`
      );

      const existingPdfBytes = _fs.default.readFileSync(
        `./public/file/items/${nama}${fileExt}`
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
        `./public/file/items/${nama}${fileExt}`,
        pdfBytes
      );
    }

    res.status(200).json("Item berhasil diupdate");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
exports.renameItems = renameItems;
