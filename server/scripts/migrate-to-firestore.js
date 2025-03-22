const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function migrateUsers() {
  console.log('Migrating users...');
  const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
  const batch = db.batch();

  for (const user of users) {
    const userId = user._id.$oid;
    delete user._id;
    delete user.__v;

    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, {
      ...user,
      createdAt: new Date(user.createdAt.$date),
      updatedAt: new Date(user.updatedAt.$date),
      lastLogin: user.lastLogin ? new Date(user.lastLogin.$date) : null,
      subscription: user.subscription ? {
        ...user.subscription,
        currentPeriodEnd: new Date(user.subscription.currentPeriodEnd.$date)
      } : null
    });
  }

  await batch.commit();
  console.log(`Migrated ${users.length} users`);
}

async function migrateGamification() {
  console.log('Migrating gamification data...');
  const gamificationData = JSON.parse(fs.readFileSync('./gamification.json', 'utf8'));
  const batch = db.batch();

  for (const data of gamificationData) {
    const userId = data.user.$oid;
    delete data.user;
    delete data._id;
    delete data.__v;

    const gamificationRef = db.collection('gamification').doc(userId);
    batch.set(gamificationRef, {
      ...data,
      userId,
      last_activity: new Date(data.last_activity.$date),
      points_history: data.points_history.map(ph => ({
        ...ph,
        date: new Date(ph.date.$date)
      })),
      streak_history: data.streak_history.map(sh => ({
        ...sh,
        date: new Date(sh.date.$date)
      })),
      badges: data.badges.map(badge => ({
        ...badge,
        earned_at: new Date(badge.earned_at.$date)
      }))
    });
  }

  await batch.commit();
  console.log(`Migrated ${gamificationData.length} gamification records`);
}

async function migratePromptResponses() {
  console.log('Migrating prompt responses...');
  const responses = JSON.parse(fs.readFileSync('./promptResponses.json', 'utf8'));
  const batch = db.batch();

  for (const response of responses) {
    const responseId = response._id.$oid;
    const userId = response.user.$oid;
    const promptId = response.prompt.$oid;
    delete response._id;
    delete response.user;
    delete response.prompt;
    delete response.__v;

    const responseRef = db.collection('promptResponses').doc(responseId);
    batch.set(responseRef, {
      ...response,
      userId,
      promptId,
      createdAt: new Date(response.createdAt.$date),
      updatedAt: new Date(response.updatedAt.$date)
    });
  }

  await batch.commit();
  console.log(`Migrated ${responses.length} prompt responses`);
}

async function migrateQuizResponses() {
  console.log('Migrating quiz responses...');
  const responses = JSON.parse(fs.readFileSync('./quizResponses.json', 'utf8'));
  const batch = db.batch();

  for (const response of responses) {
    const responseId = response._id.$oid;
    const userId = response.user_id.$oid;
    delete response._id;
    delete response.user_id;
    delete response.__v;

    const responseRef = db.collection('quizResponses').doc(responseId);
    batch.set(responseRef, {
      ...response,
      userId,
      completedAt: new Date(response.completed_at.$date)
    });
  }

  await batch.commit();
  console.log(`Migrated ${responses.length} quiz responses`);
}

async function migrateForumPosts() {
  console.log('Migrating forum posts...');
  const posts = JSON.parse(fs.readFileSync('./forumPosts.json', 'utf8'));
  const batch = db.batch();

  for (const post of posts) {
    const postId = post._id.$oid;
    const authorId = post.author.$oid;
    delete post._id;
    delete post.author;
    delete post.__v;

    const postRef = db.collection('forumPosts').doc(postId);
    batch.set(postRef, {
      ...post,
      authorId,
      likes: post.likes.map(like => like.$oid),
      createdAt: new Date(post.createdAt.$date),
      updatedAt: new Date(post.updatedAt.$date)
    });
  }

  await batch.commit();
  console.log(`Migrated ${posts.length} forum posts`);
}

async function migrateForumComments() {
  console.log('Migrating forum comments...');
  const comments = JSON.parse(fs.readFileSync('./forumComments.json', 'utf8'));
  const batch = db.batch();

  for (const comment of comments) {
    const commentId = comment._id.$oid;
    const authorId = comment.author.$oid;
    const postId = comment.post.$oid;
    delete comment._id;
    delete comment.author;
    delete comment.post;
    delete comment.__v;

    const commentRef = db.collection('forumComments').doc(commentId);
    batch.set(commentRef, {
      ...comment,
      authorId,
      postId,
      parentCommentId: comment.parentComment?.$oid || null,
      likes: comment.likes.map(like => like.$oid),
      createdAt: new Date(comment.createdAt.$date),
      updatedAt: new Date(comment.updatedAt.$date)
    });
  }

  await batch.commit();
  console.log(`Migrated ${comments.length} forum comments`);
}

async function main() {
  try {
    console.log('Starting migration from MongoDB to Firestore...');
    
    // Migrate data
    await migrateUsers();
    await migrateGamification();
    await migratePromptResponses();
    await migrateQuizResponses();
    await migrateForumPosts();
    await migrateForumComments();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main(); 