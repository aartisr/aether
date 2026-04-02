import React from 'react';
import BlogThemeSwitcher from '../../components/BlogThemeSwitcher';
import './blog.css';

type BlogLayoutProps = {
  children: React.ReactNode;
};

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="blog-shell">
      {children}
      <BlogThemeSwitcher />
    </div>
  );
}
