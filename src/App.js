import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './Post';
import { db, auth } from './firebase';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button, Input } from '@material-ui/core';
import ImageUpload from './ImageUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in
        console.log(authUser);
        setUser(authUser);

      } else {
        // user has logged out
        setUser(null);
      }

    })

    return () => {
      //perform some cleanup actions
      unsubscribe();
    }
  }, [user, username]);

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, []);

  const signUp = (event) => {
    event.preventDefault();

    auth
    .createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      return authUser.user.updateProfile({
        displayName: username
      })
    })
    .catch((error) => alert(error.message));

    setOpen(false);
  }

  const signIn = (event) => {
    event.preventDefault();

    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))

    setOpenSignIn(false);
  }

  return (
    <div className="app"> 
      <Modal
        open = {open}
        onClose = {() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
        <form className="app_signup">
          <center>
            <img 
              src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
              alt="" 
              className="app_headerImage"
            />
          </center>
          <Input
            placeholder="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" onClick={signUp}>Sign Up</Button>
        </form>
         
        </div>
      </Modal>

      <Modal
        open = {openSignIn}
        onClose = {() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
        <form className="app_signup">
          <center>
            <img 
              src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
              alt="" 
              className="app_headerImage"
            />
          </center>
          <Input
            placeholder="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" onClick={signIn}>로그인</Button>
        </form>   
        </div>
      </Modal>

      <div className="app_header">
        <img 
          className="app_headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" 
          alt="" 
        />
        
        {user ? (
          <Button onClick={() => auth.signOut()}>로그아웃</Button>
        ): (
          <div className="app_loginContainer">
            <Button onClick={() => setOpenSignIn(true)}>로그인</Button>
            <Button onClick={() => setOpen(true)}>회원가입</Button>
          </div>
        )}
      </div>

      <div className="app_posts">
        {
          posts.map(({id, post}) => (
            <Post 
            key={id}
            postId={id}
            user={user}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
            />
          ))
        }
      </div>

      {user?.displayName ? (
        <ImageUpload username={user.displayName}/>
      ): (
        <h3>글을 작성하려면 로그인해야합니다.</h3>
      )}

    </div>
  );
}

export default App;
