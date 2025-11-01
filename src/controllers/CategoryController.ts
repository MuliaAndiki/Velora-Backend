import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import { PickCreateCategory, PickGetID } from "@/types/category.types";
import prisma from "prisma/client";
import { tr } from "zod/locales";

class CategoryController {
  public async create(c: AppContext) {
    try {
      const cate = c.body as PickCreateCategory;
      const jwtUser = c.user as JwtPayload;

      if (!cate.name) {
        return c.json?.(
          {
            status: 400,
            message: "Name for category is required",
          },
          400
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: jwtUser.id },
      });

      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "User not found",
          },
          404
        );
      }

      const category = await prisma.category.create({
        data: {
          name: cate.name,
          user: { connect: { id: user.id } },
        },
      });

      return c.json?.(
        {
          status: 201,
          message: "Success create category",
          data: category,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }

  public async getCategory(c: AppContext) {
    try {
      const user = c.user as JwtPayload;
      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }
      const category = await prisma.category.findMany({
        where: { userID: user.id },
        select: {
          id: true,
          name: true,
        },
      });
      const data = {
        items: category.map((cat) => cat),
        userID: user.id,
      };

      return c.json?.(
        {
          status: 200,
          message: "Category Success Get",
          data: data,
        },
        200
      );
    } catch (error) {
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async getCategoryByID(c: AppContext) {
    try {
      const cate = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.(
          {
            status: 400,
            message: "User Not Found",
          },
          400
        );
      }
      if (!cate.id) {
        return c.json?.(
          {
            status: 400,
            message: "Params is required",
          },
          400
        );
      }
      const category = await prisma.category.findUnique({
        where: {
          id: cate.id,
          userID: jwtUser.id,
        },
        select: {
          id: true,
          createdAt: true,
          name: true,
          updatedAt: true,
          userID: true,
        },
      });

      if (!category) {
        return c.json?.(
          {
            status: 400,
            message: "ID Category Not Found",
          },
          400
        );
      }

      return c.json?.({
        status: 200,
        message: "Succes Get Category",
        data: category,
      });
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  public async deleteCategoryByID(c: AppContext) {
    try {
      const cate = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;
      if (!cate.id) {
        return c.json?.(
          {
            status: 400,
            message: "Params isrequired",
          },
          400
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      const category = await prisma.category.delete({
        where: {
          id: cate.id,
          userID: jwtUser.id,
        },
      });
      if (!category) {
        return c.json?.(
          {
            status: 400,
            message: "ID Not Found",
          },
          400
        );
      }

      return c.json?.(
        {
          status: 200,
          message: "Succes Delete Category",
          data: category,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  public async deleteCategoryAll(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      const category = await prisma.category.deleteMany({
        where: {
          userID: jwtUser.id,
        },
      });
      return c.json?.(
        {
          status: 200,
          message: "Success Delete All Category",
          data: category,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
  public async EditCategoryById(c: AppContext) {
    try {
      const cate = c.body as PickCreateCategory;
      const params = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!params.id) {
        return c.json?.(
          {
            status: 400,
            message: "Params Is Required",
          },
          400
        );
      }
      if (!cate.name) {
        return c.json?.(
          {
            status: 400,
            message: "Body Is Required",
          },
          400
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      const category = await prisma.category.update({
        where: {
          id: params.id,
          userID: jwtUser.id,
        },
        data: {
          name: cate.name,
        },
      });

      if (!category) {
        return c.json?.(
          {
            status: 400,
            message: "Edit Category Failed",
          },
          400
        );
      }

      return c.json?.(
        {
          status: 200,
          message: "Succes Update Category",
          data: category,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
}

export default new CategoryController();
