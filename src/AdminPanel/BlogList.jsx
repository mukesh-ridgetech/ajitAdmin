import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Avatar,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { baseurl } from "../helper/Helper";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JoditEditor from "jodit-react";
import { useAuth } from "../context/auth";
const { Option } = Select;

const BlogList = ({ setSelectedTab }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [content, setContent] = useState("");
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedImageLink, setSelectedImageLink] = useState("");
  const [imageSourceType, setImageSourceType] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [auth, setAuth] = useAuth();
  const [image1, setImage] = useState();
  // Meta tags state

  console.log("fileList", fileList);
  const [metaTags, setMetaTags] = useState([]);
  const [metaTitleOptions, setMetaTitleOptions] = useState([
    "description",
    "keywords",
    "author",
    "robots",
  ]);
  const [selectedMetaTitle, setSelectedMetaTitle] = useState("");
  const [metaContent, setMetaContent] = useState("");
  const [form] = Form.useForm();
  const editor = useRef(null);

  // Fetch blogs, authors, tags, and predefined images when the component loads

  const fetchBlogsAuthorsTags = async () => {
    try {
      const [blogsResponse, authorsResponse, tagsResponse] = await Promise.all([
        axios.get(`${baseurl}/api/blog/getAllBlog`),
        axios.get(`${baseurl}/api/admin/getUsers`),
        axios.get(`${baseurl}/api/tag/getAllTag`),
      ]);
      setBlogs(blogsResponse.data);
      setAuthors(authorsResponse.data.users);
      setTags(tagsResponse.data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchBlogsAuthorsTags();
  }, []);

  const addMetaTag = () => {
    if (selectedMetaTitle && metaContent) {
      setMetaTags([
        ...metaTags,
        { title: selectedMetaTitle, content: metaContent },
      ]);
      // Remove the selected meta title from the dropdown options
      setMetaTitleOptions(
        metaTitleOptions.filter((option) => option !== selectedMetaTitle)
      );
      setSelectedMetaTitle("");
      setMetaContent("");
    } else {
      message.error("Please select a meta title and provide its content.");
    }
  };

  const removeMetaTag = (titleToRemove) => {
    setMetaTags(metaTags.filter((tag) => tag.title !== titleToRemove));
    setMetaTitleOptions([...metaTitleOptions, titleToRemove]); // Add the removed meta title back to the dropdown
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseurl}/api/blog/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
      message.success("Blog deleted successfully");
    } catch (error) {
      console.error("Error deleting blog: ", error);
      message.error("Failed to delete the blog");
    }
  };

  const showEditModal = (blog) => {
    setCurrentBlog(blog);
    setMetaTags(blog.metaTags);
    const filteredOptions = metaTitleOptions.filter(
      (option) =>
        !blog.metaTags.some((tagDetails) => tagDetails.title === option)
    );

    // Then update the state once after all filtering
    setMetaTitleOptions(filteredOptions);
    if (blog.image) {
      setImageSourceType("url");
    }
    form.setFieldsValue({
      ...blog,
      author: blog.author?._id,
      tags: blog.tags?.map((tag) => tag._id), // Update to set tag IDs
      slug: blog.slug,
      image: blog.image, // Pre-fill image data if available
    });
    setContent(blog.content || "");
    setSlug(blog.slug || "");
    setIsModalVisible(true);
  };

  const uploadImage = async (file) => {
    if (!file) {
      message.error("No file provided for upload.");
      return null;
    }

    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${baseurl}/api/uploadImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response && response.data && response.data.imageUrl) {
        message.success("Image uploaded successfully!");
        setImage(response.data.imageUrl); // Update the state with the returned image URL
        return response.data.imageUrl;
      } else {
        message.error("Image uploaded but no URL was returned.");
        return null;
      }
    } catch (error) {
      message.error("Error uploading image. Please try again later.");
      console.error(
        "Image upload error:",
        error.response?.data || error.message
      );
      return null;
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedBlog = {
        ...form.getFieldsValue(),
        content,
        image: imageSourceType === "url" ? imageUrl : image1,
        slug,
        modifiedBy: auth.user._id,
        metaTags,
      };
      const response = await axios.put(
        `${baseurl}/api/blog/${currentBlog._id}`,
        updatedBlog
      );
      message.success("Blog updated successfully");

      if (response) {
        fetchBlogsAuthorsTags();
      }

      setIsModalVisible(false);
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === currentBlog._id ? { ...blog, ...updatedBlog } : blog
        )
      );
    } catch (error) {
      console.error("Error updating blog: ", error);
      message.error("Failed to update the blog");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      render: (image) =>
        image ? (
          <img
            src={`${baseurl}${image}`}
            alt="Blog"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Author Name",
      dataIndex: ["author", "name"],
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        onClick={() => setSelectedTab("blog-post")}
        style={{ marginBottom: "20px" }}
      >
        Add New Blog
      </Button>
      <Table columns={columns} dataSource={blogs} rowKey="_id" />

      <Modal
        title="Edit Blog"
        visible={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          {/* Existing Fields */}
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: "Please enter a slug" }]}
          >
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please select an author!" }]}
          >
            <Select placeholder="Select author">
              {authors.map((author) => (
                <Option key={author._id} value={author._id}>
                  {author.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <p>Meta Tag Manager</p>
          <div style={{ marginBottom: "20px" }}>
            <Select
              placeholder="Select Meta Title"
              value={selectedMetaTitle}
              onChange={setSelectedMetaTitle}
              style={{ width: "200px", marginRight: "10px" }}
            >
              {metaTitleOptions.map((title) => (
                <Option key={title} value={title}>
                  {title}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="Meta Content"
              value={metaContent}
              onChange={(e) => setMetaContent(e.target.value)}
              style={{ width: "300px", marginRight: "10px" }}
            />
            <Button type="primary" onClick={addMetaTag}>
              Add Meta Tag
            </Button>
          </div>
          {metaTags.map((metaTag) => (
            <div key={metaTag.title} style={{ marginBottom: "10px" }}>
              <span>
                {metaTag.title}: {metaTag.content}
              </span>
              <Button
                type="link"
                onClick={() => removeMetaTag(metaTag.title)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </Button>
            </div>
          ))}

          <Form.Item name="tags" label="Tags">
            <Select mode="multiple" placeholder="Select tags">
              {tags.map((tag) => (
                <Option key={tag._id} value={tag._id}>
                  {tag.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Image Selection */}
          <Form.Item label="Image" name="image">
            <Select
              value={imageSourceType}
              onChange={(value) => setImageSourceType(value)}
            >
              <Option value="upload">Upload Image</Option>
              <Option value="url">Use Image URL</Option>
            </Select>

            {imageSourceType === "upload" && (
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0]; // Retrieve the first selected file
                  if (file) {
                    console.log("File selected:", file);
                    uploadImage(file); // Pass the file to your upload function
                  } else {
                    message.error("No file selected for upload.");
                  }
                }}
                accept="image/*"
              />
            )}

            {imageSourceType === "url" && (
              <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}

            {/* {imageSourceType === "upload" && fileList.length > 0 && (
              <img
                src={URL.createObjectURL(fileList[0])}
                alt="Selected Image"
                style={{ width: "100px", marginTop: "10px" }}
              />
            )} */}

            {imageSourceType === "url" && imageUrl && (
              <img
                src={imageUrl}
                alt="Image URL"
                style={{ width: "100px", marginTop: "10px" }}
              />
            )}
          </Form.Item>

          {/* <Form.Item label="Content">
            <JoditEditor
              ref={editor}
              value={content}
              onBlur={(newContent) => setContent(newContent)}
              tabIndex={1}
              placeholder="Update your content here..."
            />
          </Form.Item> */}
          <Form.Item label="Content" required>
            <JoditEditor
              ref={editor}
              value={content}
              onBlur={(newContent) => setContent(newContent)}
              tabIndex={1}
              placeholder="Write your content here..."
              config={{
                cleanHTML: {
                  removeEmptyTags: false,
                  fillEmptyParagraph: false,
                  removeEmptyBlocks: false,
                },
                uploader: {
                  url: `${baseurl}/api/amenities/uploadImage`, // Your image upload API endpoint
                  format: "json", // Specify the response format
                  isSuccess: function (resp) {
                    return !resp.error;
                  },
                  getMsg: function (resp) {
                    return resp.msg && Array.isArray(resp.msg)
                      ? resp.msg.join(" ")
                      : resp.msg;
                  },
                  process: function (resp) {
                    return {
                      files: resp.files || [],
                      path:
                        resp.files && resp.files.length > 0
                          ? resp.files[0].url
                          : "", // Ensure safe URL handling
                      baseurl:
                        resp.files && resp.files.length > 0
                          ? resp.files[0].url
                          : "",
                      error: resp.error || "Error uploading file",
                      msg: resp.msg || "Upload failed",
                    };
                  },
                  defaultHandlerSuccess: function (data, resp) {
                    const files = data.files || [];
                    if (files.length > 0 && files[0].url) {
                      this.selection.insertImage(files[0].url, null, 250);
                    } else {
                      console.error("No image URL found in the response");
                    }
                  },
                },
                enter: "DIV",
                defaultMode: "DIV",
                removeButtons: ["font"], // You can adjust which buttons you want to remove
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogList;
