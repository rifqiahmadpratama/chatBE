const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const {
  selectWorker,
  findID,
  findEmail,
  create,
  updateAccount,
  updateimage,
  countData,
} = require("../models/users");
const commonHelper = require("../helper/common");
const authHelper = require("../helper/auth");

const UserController = {
  getAll: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const sortby = req.query.sortby || "name";
      const sort = req.query.sort || "asc";
      const search = req.query.search || "";
      const email = req.payload.email;

      const { rows: worker } = await selectWorker({
        limit,
        offset,
        sortby,
        search,
        sort,
        email,
      });

      const {
        rows: [count],
      } = await countData();
      const totalData = parseInt(count.total);
      const totalPage = Math.ceil(totalData / limit);
      const pagination = {
        currentPage: page,
        limit,
        totalData,
        totalPage,
      };

      commonHelper.response(res, worker, 200, "get data success", pagination);
    } catch (error) {
      //  next(createError);
      console.log(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      const { rowCount } = await findEmail(email);

      const passwordHash = bcrypt.hashSync(password);

      if (rowCount) {
        return next(createError(403, "Email is already used"));
      }
      const data = {
        id: uuidv4(),
        email,
        passwordHash,
        name,
      };
      create(data)
        .then((result) =>
          commonHelper.response(res, result.rows, 201, "Users Job created")
        )
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const {
        rows: [user],
      } = await findEmail(email);
      if (!user) {
        return commonHelper.response(res, null, 403, "Email is invalid");
      }
      const passwordHash = bcrypt.hashSync(password);
      console.log("Tes = " + passwordHash);

      if (!passwordHash) {
        return commonHelper.response(res, null, 403, "Password is invalid");
      }
      delete user.password;
      const payload = {
        email: user.email,
      };
      user.token = authHelper.generateToken(payload);
      user.refreshToken = authHelper.generateRefershToken(payload);

      commonHelper.response(res, user, 201, "login is successful");
    } catch (error) {
      console.log(error);
    }
  },
  updatePhoto: async (req, res, next) => {
    try {
      const PORT = process.env.PORT || 3200;
      const DB_HOST = process.env.DB_HOST || "localhost";
      const email = req.payload.email;
      console.log("cek email = " + email);
      const photo = req.file.filename;

      const { rowCount } = await findEmail(email);
      if (!rowCount) {
        // return next(createError(403, "Email is Not Found"));
        return console.log(403, "Email Tidak ada");
      }
      const data = {
        email,
        photo: `http://${DB_HOST}:${PORT}/img/${photo}`,
      };
      updateimage(data)
        .then((result) =>
          commonHelper.response(res, result.rows, 200, "profile updated")
        )
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },
  profileupdate: async (req, res, next) => {
    const email = req.payload.email;
    const { name, gender, phone, date_of_birth, bio } = req.body;
    const {
      rows: [user],
    } = await findEmail(email);
    delete user.password;

    await updateAccount(email, name, gender, phone, date_of_birth, bio)
      .then((result) =>
        commonHelper.response(res, result.rows, 201, "Users  update")
      )
      .catch((err) => res.send(err));
  },
  profile: async (req, res, next) => {
    const email = req.payload.email;
    const {
      rows: [user],
    } = await findEmail(email);
    delete user.password;
    commonHelper.response(res, user, 200);
  },

  profilefriend: async (req, res, next) => {
    const id = req.params.id;
    const {
      rows: [user],
    } = await findID(id);

    commonHelper.response(res, user, 200);
  },

  refreshToken: (req, res) => {
    const refershToken = req.body.refershToken;
    const decoded = jwt.verify(refershToken, process.env.SECRETE_KEY_JWT);
    const payload = {
      email: decoded.email,
    };
    const result = {
      token: authHelper.generateToken(payload),
      refershToken: authHelper.generateRefershToken(payload),
    };
    commonHelper.response(res, result, 200);
  },
};

module.exports = UserController;
