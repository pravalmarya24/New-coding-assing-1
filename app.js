let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let { format } = require("date-fns");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "todoApplication.db");

initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, function () {
      console.log("Server is running at http://localhost:3001/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertTodoDataIntoResponse = (ObjectData) => {
  let { id, todo, priority, status, category, due_date } = ObjectData;
  return {
    id: id,
    todo: todo,
    priority: priority,
    status: status,
    category: category,
    dueDate: due_date,
  };
};

app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let getTodoQueryById = `
        SELECT *
        FROM todo
        WHERE
            id = ${todoId};`;
  let dataById = await db.get(getTodoQueryById);
  response.send(convertTodoDataIntoResponse(dataById));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let newDate = format(new Date(date), "yyyy-MM-dd");
  console.log(newDate);
  let getDateQuery = `
            SELECT *
            FROM todo
            WHERE
                due_date= ${newDate};`;
  let getDataByDate = await db.all(getDateQuery);
  response.send(getDataByDate);
});

app.post("/todos/", async (request, response) => {
  let newTodo = request.body;
  let { id, todo, priority, status, category, dueDate } = newTodo;
  let postNewTodoQuery = `
            INSERT INTO
            todo (id,todo,priority,status,category,due_date)
            VALUES (
                ${id},
                '${todo}',
                '${priority}',
                '${status}',
                '${category}',
                ${dueDate});`;
  await db.run(postNewTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let requestBody = request.body;
  let updatedColumn = "";

  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updatedColumn = "Category";
      break;
    case requestBody.due_date !== undefined:
      updatedColumn = "Due Date";
      break;
  }

  let prevQuery = `
            SELECT *
            FROM todo
            WHERE 
                id = ${todoId};`;
  const prevData = await db.get(prevQuery);
  const {
    todo: todo,
    priority: priority,
    status: status,
    category: category,
    due_date: due_date,
  } = request.body;

  let NewUpdatedQuery = `
                UPDATE 
                todo
                SET
                   todo='${todo}',
                   priority='${priority}',
                   status='${status}',
                   category='${category}',
                   due_date='${dueDate}',`;
  let newData = await db.run(NewUpdatedQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let deleteQuery = `
            DELETE 
            FROM todo 
            WHERE id = ${todoId};`;
  let deleData = await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
