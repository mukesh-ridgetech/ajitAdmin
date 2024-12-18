import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Button, Dropdown } from "antd";
import "../Style/AdminPanel.css";
import {
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  CarryOutOutlined,
  FormOutlined,
  HomeOutlined,
  WarningOutlined,
  TruckOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

import Users from "./Users";
import BlogList from "./BlogList";
import BlogPosting from "./BlogPosting";

// properties-details

const AdminPanel = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const [id, setId] = useState();
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    setSelectedTab(e.key);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "users":
        return <Users />;
      case "blog":
        return <BlogList setSelectedTab={setSelectedTab} />;
      case "blog-post":
        return <BlogPosting setSelectedTab={setSelectedTab} />;

      // BlogList
    }
  };

  const menuItems = [
    // { key: "home", icon: <TeamOutlined />, label: "Home" },
    { key: "users", icon: <TeamOutlined />, label: "Users" },
    { key: "blog", icon: <CarOutlined />, label: "Blog" },
  ];

  return (
    <Layout style={{ minHeight: "100vh", maxWidth: "100vw" }}>
      <Header className="header">
        <div className="logo-vinMart">
          {/* <img src={logo} alt="dewanRealty Logo" /> */}
          <h1>logo</h1>
        </div>

        <Button
          type="primary"
          onClick={handleLogout}
          style={{ marginLeft: "20px" }}
        >
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider className="sider">
          <Menu
            mode="inline"
            defaultSelectedKeys={["dashboard"]}
            style={{ height: "100%", borderRight: 0 }}
            onClick={handleMenuClick}
          >
            {/* <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              Dashboard
            </Menu.Item> */}

            {menuItems?.map((menuItem) => (
              <Menu.Item key={menuItem?.key} icon={menuItem?.icon}>
                {menuItem?.label}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        <Layout style={{ padding: "24px" }}>
          <Content className="content">{renderContent()}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminPanel;
