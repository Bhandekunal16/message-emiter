const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "neo4j+s://b76e3d84.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "kH8WQkwu-vK5bmjUYjJ2oe1kbcBeoZdDeErj9o8woSk")
);

const session = driver.session();

class query {
  async create(body) {
    const result = await session.run(
      "CREATE (m:Message {username: $username, message: $message}) RETURN m",
      { username: body.username, message: body.message }
    );

    return { message: "submitted successfully" };
  }

  async getMessage() {
    const array = await session.run(
      "match (n:Message) return collect(properties(n)) as message"
    );

    return { data: array.records[0].get("message") };
  }
}

module.exports = query;
