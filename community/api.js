//API script for fetching chat messages and creating chat messages using Drag00nKnight999/Marty-Games-Chat/ as a database.
const OWNER = "Drag00nKnight999";
const REPO = "Marty-Games-Chat";

// load comments from an issue

async function getComments(issue){

const res = await fetch(
`https://api.github.com/repos/${OWNER}/${REPO}/issues/${issue}/comments`
);

return await res.json();

}

// load posts

async function getPosts(){

const res = await fetch(
`https://api.github.com/repos/${OWNER}/${REPO}/issues`
);

return await res.json();

}
