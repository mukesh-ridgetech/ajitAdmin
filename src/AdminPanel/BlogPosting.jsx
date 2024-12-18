import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Select, Upload, message, Radio } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import axios from "axios";
import { baseurl } from "../helper/Helper";
// import { PlusOneOutlined } from "@mui/icons-material";

const { Dragger } = Upload;
const { Option } = Select;

const BlogPosting = ({ setSelectedTab }) => {
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [imageSourceType, setImageSourceType] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploadedImageId, setUploadedImageId] = useState(null);
  const [selectedImageLink, setSelectedImageLink] = useState("");
  const [predefinedImageLinks, setPredefinedLink] = useState([]);
  const [slug, setSlug] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  // Meta tags state
  const [metaTags, setMetaTags] = useState([]);
  const [metaTitleOptions, setMetaTitleOptions] = useState([
    "description",
    "keywords",
    "author",
    "robots",
  ]);
  const [selectedMetaTitle, setSelectedMetaTitle] = useState("");
  const [metaContent, setMetaContent] = useState("");

  console.log("metaTags", metaTags);
  const navigate = useNavigate();
  const editor = useRef(null);
  useEffect(() => {
    const fetchTagsAndAuthors = async () => {
      try {
        const [tagResponse, userResponse, imageResponse] = await Promise.all([
          axios.get(baseurl + "/api/tag/getAllTag"),
          axios.get(baseurl + "/api/admin/getUsers"),
          axios.get("https://api.ridgetechcorp.com/api/images"),
        ]);

        console.log(userResponse.data);
        setTags(tagResponse.data);
        setAuthors(userResponse?.data?.users);
        setPredefinedLink(imageResponse?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchTagsAndAuthors();
  }, []);

  const handleImageLinkChange = (value) => {
    setSelectedImageLink(value);
  };

  const uploadImage = async (file) => {
    console.log(file);
    const formData = new FormData();
    formData.append("image", file.file);
    // console.log(file.file.name);

    try {
      const response = await axios.post(
        `${baseurl}/api/amenities/uploadImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response) {
        message.success("Image uploaded successfully!");
        setImage(response.data.imageUrl);
      }

      return response.data.imageUrl; // Assuming the API returns the image URL in the 'url' field
    } catch (error) {
      message.error("Error uploading image. Please try again later.");
      console.error("Image upload error:", error);
      return null;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let image = "";
      if (imageSourceType === "url") {
        image = imageUrl;
      } else if (fileList.length > 0) {
        const formData = new FormData();
        formData.append("image", fileList[0]);

        const response = await axios.post(
          `${baseurl}/api/uploadImage`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        image = response.data.imageUrl;
      }

      const blogData = {
        ...values,
        content: editorContent,
        tags: selectedTags,
        authorId: selectedAuthor,
        image,
        slug,
        date: new Date().toLocaleString(),
        metaTags,
      };

      const response = await axios.post(
        baseurl + "/api/blog/createBlog",
        blogData
      );
      message.success("Blog posted successfully");
      console.log("response is ", response.data);
      setSelectedTab("blog");
      //   navigate("/blog-list");
    } catch (error) {
      console.error("Error posting blog:", error);
      message.error("Failed to post blog");
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (value) => {
    setSelectedTags(value);
  };

  const handleAuthorChange = (value) => {
    setSelectedAuthor(value);
  };

  const handleImageSourceChange = (e) => {
    setImageSourceType(e.target.value);
  };

  const handleFileChange = (info) => {
    // Clear the image preview when there are no files
    if (info.fileList.length === 0) {
      // setImagePreview(null);
      setFileList([]); // Reset fileList as an empty array
      return;
    }

    const file = info.file; // Get the uploaded file
    console.log({ file, info });
    if (file) {
      setFileList([file]); // Set fileList as an array containing the file

      // Generate image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Revoke the object URL to prevent memory leaks when it's no longer needed
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  // Function to generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple hyphens with a single one
      .replace(/^-+|-+$/g, ""); // Trim hyphens at the start and end
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setSlug(generateSlug(title)); // Generate slug when title changes
  };
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

  return (
    <div
      style={{
        margin: "0 auto",
        padding: "20px",
        background: "white",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Create Blog Post
      </h2>
      <Form name="blog_posting" layout="vertical" onFinish={onFinish}>
        {/* Image Source Type Selection */}
        <Form.Item label="Image Source">
          <Radio.Group
            onChange={handleImageSourceChange}
            value={imageSourceType}
          >
            <Radio value="upload">Upload Image</Radio>
            <Radio value="url">Use Image URL</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Conditionally Render Upload or URL Input */}
        {imageSourceType === "upload" ? (
          <Form.Item
            name="image"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Dragger
              multiple={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
              fileList={fileList}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </Form.Item>
        ) : (
          <Form.Item
            name="imageLink"
            label="Select Image"
            rules={[{ required: true, message: "Please select an image!" }]}
          >
            <Select
              placeholder="Select an image"
              onChange={handleImageLinkChange}
            >
              {predefinedImageLinks?.map((link, index) => (
                <Option key={index} value={link.url}>
                  {link.url}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {imagePreview && <img src={imagePreview} className="w-32" />}
        <Form.Item
          name="author"
          label="Author"
          rules={[{ required: true, message: "Please select an author!" }]}
        >
          <Select placeholder="Select author" onChange={handleAuthorChange}>
            {authors?.map((author) => (
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
            {metaTitleOptions?.map((title) => (
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
        {metaTags?.map((metaTag) => (
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
        <Form.Item
          name="title"
          label="Blog Title"
          rules={[{ required: true, message: "Please input the blog title!" }]}
        >
          <Input placeholder="Enter blog title" onChange={handleTitleChange} />
        </Form.Item>
        <p>Generated Slug : {slug}</p>
        <Form.Item
          name="slug"
          label="Slug"
          initialValues={slug}
          rules={[{ required: true, message: "Please input the slug!" }]}
        >
          <Input placeholder="Enter slug" value={slug} />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="multiple"
            placeholder="Select tags"
            onChange={handleTagChange}
          >
            {tags?.map((tag) => (
              <Option key={tag._id} value={tag._id}>
                {tag.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Content" required>
          <JoditEditor
            ref={editor}
            value={editorContent}
            onBlur={(newContent) => setEditorContent(newContent)}
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
                // This function handles the response
                format: "json", // Specify the response format
                isSuccess: function (resp) {
                  return !resp.error;
                },
                getMsg: function (resp) {
                  return resp.msg.join !== undefined
                    ? resp.msg.join(" ")
                    : resp.msg;
                },
                process: function (resp) {
                  return {
                    files: resp.files || [],
                    path: resp.files.url,
                    baseurl: resp.files.url,
                    error: resp.error || "error",
                    msg: resp.msg || "iuplfn",
                  };
                },
                defaultHandlerSuccess: function (data, resp) {
                  const files = data.files || [];
                  console.log({ files });
                  if (files) {
                    this.selection.insertImage(files.url, null, 250);
                  }
                },
              },
              enter: "DIV",
              defaultMode: "DIV",
              removeButtons: ["font"],
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit
          </Button>
          <Button
            type="default"
            onClick={() => navigate("/admin")}
            block
            style={{ marginTop: "10px" }}
          >
            Go Back
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BlogPosting;
