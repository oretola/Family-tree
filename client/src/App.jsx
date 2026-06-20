import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import AddMember from './pages/AddMember';
import Gallery from './pages/Gallery';
import Messages from './pages/Messages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="members" element={<Members />} />
          <Route path="members/add" element={<AddMember />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="members/:id/edit" element={<AddMember />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
