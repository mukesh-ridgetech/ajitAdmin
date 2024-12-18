import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Upload,
  Switch,
} from "antd";
import { baseurl } from "../helper/Helper";
import axios from "axios";
import Password from "antd/es/input/Password";
// import { baseurl } from "../helper/Helper";
import { useAuth } from "../context/auth";

const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [auth, setAuth] = useAuth();

  // console.log(auth?.user._id);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(baseurl + "/api/admin/getUsers");

      console.log(res.data.users);
      setData(res.data.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    console.log(record.email);
    form.setFieldsValue({
      name: record.name,
      username: record.email,
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (record) => {
    try {
      const response = await axios.patch(
        `${baseurl}/api/admin/toggled/${record?._id}`
      );
      console.log(response);

      if (response) {
        message.success("Status updated succesfully");
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePost = async (values) => {
    const postData = {
      name: values.name,
      email: values.username,
      password: values.password,
      createdBy: auth?.user?._id,
    };

    try {
      const response = await axios.post(
        baseurl + "/api/admin/onboard",
        postData
      );
      console.log(response.data);

      if (response.data) {
        setIsModalOpen(false);
        message.success("User created successfully!");
        fetchData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePut = async (values) => {
    const postData = {
      name: values.name,
      email: values.username,
      password: values.password,
    };

    try {
      const response = await axios.put(
        `${baseurl}/api/admin/update/${editingUser?._id}`,
        postData
      );
      console.log(response.data);

      if (response.data) {
        setIsModalOpen(false);
        fetchData();
        message.success("User update successfully!");
        form.resetFields();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (values) => {
    if (editingUser) {
      await handlePut(values);
    } else {
      await handlePost(values);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Status",
      key: "Status",
      render: (_, record) => (
        <Switch
          checked={record.Status === "Active"}
          onChange={() => handleStatusToggle(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Update</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Add Users
      </Button>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        // rowKey="_id"
      />

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? "Update" : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
