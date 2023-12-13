import { mkdir, unlink, writeFile } from 'fs';
import { nanoid } from 'nanoid/non-secure';
import { Op } from 'sequelize';
import fields from './fields';

const reg = /.+@.+\.[A-Za-z]+$/;
const numbers = /[0-9]/g;

interface ICheckResult {
  correct: boolean;
  error?: string;
  result?: string;
}

export const checkForEmptyFields = (
  body: Record<string, any>,
  fieldsToCheck: string[],
) => {
  const checkSingleField = (field: string) => {
    if (!body[field]) {
      throw new Error(`Заполните поле ${fields[field]}`);
    }
  };

  fieldsToCheck.forEach((field) => checkSingleField(field));

  return true;
};

export const checkEmail = (value: string): ICheckResult => {
  if (!value.match(reg))
    return { correct: false, error: 'You have entered an invalid email' };
  return { correct: true, result: value };
};
export const checkPhone = (value: string): ICheckResult => {
  // console.log('value', value);
  if (value.match(numbers).length < 11)
    return {
      correct: false,
      error: 'Минимальная длина телефона - 11 символов',
    };
  return { correct: true, result: value.match(numbers).join('') };
};
export const maskPhone = (phone: string): string => {
  const clearPhone = phone.replace(/[\[\]{}+()-]|\s/gm, '');
  if (clearPhone.length === 11) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 12) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 13) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{3})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
  if (clearPhone.length === 14) {
    const numberSplice = clearPhone
      .replace(/\D/g, '')
      .match(/(\d{4})(\d{3})(\d{3})(\d{2})(\d{2})/);
    return `+${numberSplice[1]} (${numberSplice[2]}) ${numberSplice[3]}-${numberSplice[4]}-${numberSplice[5]}`;
  }
};

interface WhereClauseParams {
  initial?: Record<string, any>;
  queries: Record<string, string>;
  limit?: number;
  searchFields?: string | string[];
  extract?: string[];
}

export const getWhereClause = (params: WhereClauseParams) => {
  const extractInnerWhereClause = ({
    queries,
    fields,
  }: {
    queries: Record<string, string>;
    fields: string[];
  }) => {
    const rawQueries = { ...queries };
    const extracted = {};

    fields.forEach((field) => {
      if (Object.keys(rawQueries).includes(field)) {
        extracted[field] = rawQueries[field];
        delete rawQueries[field];
      }
    });

    return { extracted, queries: rawQueries };
  };

  const { initial, queries, searchFields } = params;
  const whereClause = { ...initial };
  let rawQueries = { ...queries };
  let extracted;

  if (params.extract && params.extract.length) {
    const { extracted: e, queries } = extractInnerWhereClause({
      queries: params.queries,
      fields: params.extract,
    });
    rawQueries = { ...queries };
    extracted = e;
  } else {
    rawQueries = { ...queries };
  }

  let page = 1;
  let limit: number = params.limit || 20;
  let order;

  if (Object.keys(rawQueries).includes('page')) {
    console.log('includes page');
    page = +rawQueries.page;
    delete rawQueries.page;
  }

  if (Object.keys(rawQueries).includes('limit')) {
    limit = +rawQueries.limit;
    delete rawQueries.limit;
  }

  if (
    Object.keys(rawQueries).includes('search') &&
    (searchFields || searchFields.length) &&
    !!rawQueries.search
  ) {
    if (typeof searchFields === 'string') {
      whereClause[searchFields] = { [Op.iLike]: `%${rawQueries.search}%` };
    } else {
      const or = [];
      searchFields.forEach((field) =>
        or.push({ [field]: { [Op.iLike]: `%${rawQueries.search}%` } }),
      );
      whereClause[Op.or as any] = or;
    }
    delete rawQueries.search;
  }
  if (!rawQueries.search) {
    delete rawQueries.search;
  }

  Object.entries(rawQueries).forEach((entry: [string, string]) => {
    if (entry[1] === 'null') return;
    if (entry[1].includes(',')) {
      return (whereClause[entry[0]] = { [Op.in]: entry[1].split(',') });
    }
    if (entry[1].includes('-')) {
      const [from, to] = entry[1].split('-');
      if (from === 'null' && to === 'null') return;
      if (from === 'null') {
        return (whereClause[entry[0]] = { [Op.lte]: +to });
      }
      if (to === 'null') {
        return (whereClause[entry[0]] = { [Op.gte]: +from });
      }
      return (whereClause[entry[0]] = { [Op.between]: entry[1].split('-') });
    }
    return (whereClause[entry[0]] = entry[1]);
  });

  console.log(page, limit);
  let offset = 0;
  if (page && limit) {
    offset = page * limit - limit;
  }
  console.log(offset);

  return { whereClause, _limit: limit, _offset: offset, extracted };
};

export async function uploadFilesOld(
  files: Array<Express.Multer.File> | Express.Multer.File,
  dir: string,
): Promise<string[] | string> {
  try {
    const filenames = [];

    const handleOneFile = (file: Express.Multer.File) => {
      let dbFileName = null;
      // console.log(item.mimetype);

      const fileName = nanoid();
      dbFileName =
        fileName + file.originalname.slice(file.originalname.lastIndexOf('.'));

      filenames.push(dbFileName);

      const buffer = file.buffer;
      // const myBuffer = Buffer.from(item);
      writeFile(`./uploads${dir}/${dbFileName}`, buffer, (err) => {
        !!err && console.log(err);
      });
    };

    await mkdir(`./uploads${dir}`, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }
    });

    if (Array.isArray(files)) {
      files.forEach((item: Express.Multer.File) => handleOneFile(item));
    } else {
      handleOneFile(files);
    }
    return Array.isArray(files) ? filenames : filenames[0];
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}

interface WsIncomingFile {
  file: string;
  filename: string;
}

export async function uploadFiles(
  files:
    | Array<Express.Multer.File>
    | Express.Multer.File
    | WsIncomingFile
    | WsIncomingFile[],
  dir?: string,
): Promise<string[] | string> {
  try {
    const filenames = [];

    const handleOneFile = (file: Express.Multer.File) => {
      const fileName = nanoid();
      const dbFileName =
        fileName + file.originalname.slice(file.originalname.lastIndexOf('.'));

      filenames.push(dbFileName);

      const buffer = file.buffer;
      writeFile(`./uploads${dir}/${dbFileName}`, buffer, (err) => {
        !!err && console.log(err);
      });
    };

    const handleOneBlobFile = (file: WsIncomingFile) => {
      const fileName = nanoid();
      const dbFileName =
        fileName + file.filename.slice(file.filename.lastIndexOf('.'));

      filenames.push(dbFileName);

      const buffer = Buffer.from(file.file, 'base64');
      writeFile(
        `./uploads${dir}/${dbFileName}`,
        buffer,
        { encoding: 'base64' },
        (err) => {
          !!err && console.log(err);
        },
      );
    };

    const handleOneItem = (item: Express.Multer.File | WsIncomingFile) => {
      if ('originalname' in item) {
        handleOneFile(item);
      } else {
        handleOneBlobFile(item);
      }
    };

    await mkdir(`./uploads${dir}`, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
      }
    });

    if (Array.isArray(files)) {
      files.forEach((item: Express.Multer.File | WsIncomingFile) =>
        handleOneItem(item),
      );
    } else {
      handleOneItem(files);
    }
    return Array.isArray(files) ? filenames : filenames[0];
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}

export async function deleteFile(filename: string, dir?: string) {
  // const parts = `${params['slug'] + params[0]}`.split('/');
  // const dir = parts.slice(0, -1).join('/');
  // const slug = parts[parts.length - 1];

  try {
    const path = `${dir ? dir : ''}/${filename}`;

    // console.log('parts', parts);
    console.log('dir', path);
    // console.log('slug', slug);

    await unlink('./uploads/' + path, (err) => {
      if (err) throw err;
      console.log('./uploads/' + path + ' was deleted');
    });
  } catch (e) {
    console.log(e);
  }
  // return res.sendFile(slug, { root: `./uploads/` + dir + '/' });
  return { status: 204, text: 'success' };
}
