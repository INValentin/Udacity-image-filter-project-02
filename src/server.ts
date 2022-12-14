import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

// Image url validator package
const isImageURL = require('image-url-validator').default;

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (req: Request, res: Response) => {
    const image_url: string = req.query.image_url as string
    
    // check if the given query parameter is a real image url
    const is_image: boolean = await isImageURL(image_url)
    if (!is_image) {
      return res.status(400).json(
        { message: "Please provide a valid image url!" }
      )
    }

    filterImageFromURL(image_url)
      .then(filtered_image_path => {
        res.sendFile(filtered_image_path, async (err) => {
          if (err) res.status(500).json(
            { message: "Unexpected server error!" }
          )
          // delete temporary file after use
          await deleteLocalFiles([filtered_image_path])
        })
      })
      .catch(err => {
        res.status(422).json({ message: err })
      })
  })

  //! END @TODO1

  // Root Endpoint
  // Displays an HTML form to submit image url for better experience
  app.get("/", async (req: Request, res: Response) => {
    // send an html file with a form
    res.sendFile(process.cwd() + "/image_url.html");
    // res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();


