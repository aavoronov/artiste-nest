import { ComponentLoader } from 'adminjs';

export const entities = [];

export const componentLoader = new ComponentLoader();

// const Components = {
//   MyCustomAction: componentLoader.add(
//     'MyCustomAction',
//     './components/custom.tsx',
//   ),
//   Color: componentLoader.add('Color', './components/list/color.tsx'),
//   ColorShow: componentLoader.add(
//     'ColorShow',
//     './components/show/colorShow.tsx',
//   ),
//   ProfilePic: componentLoader.add(
//     'ProfilePic',
//     './components/list/ProfilePic.tsx',
//   ),
//   ProfilePicShow: componentLoader.add(
//     'ProfilePicShow',
//     './components/show/ProfilePicShow.tsx',
//   ),
//   FileLink: componentLoader.add('FileLink', './components/list/fileLink.tsx'),
//   FileLinkShow: componentLoader.add(
//     'FileLinkShow',
//     './components/show/fileLinkShow.tsx',
//   ),
//   ObjectWithComplaint: componentLoader.add(
//     'ObjectWithComplaint',
//     './components/list/objectWithComplaint.tsx',
//   ),
//   ObjectWithComplaintShow: componentLoader.add(
//     'ObjectWithComplaintShow',
//     './components/show/objectWithComplaintShow.tsx',
//   ),
//   Coordinates: componentLoader.add(
//     'Coordinates',
//     './components/list/coordinates.tsx',
//   ),
//   CoordinatesShow: componentLoader.add(
//     'CoordinatesShow',
//     './components/show/coordinates.tsx',
//   ),
//   MapObjectDetails: componentLoader.add(
//     'MapObjectDetails',
//     './components/list/mapObjectDetailsLink.tsx',
//   ),
//   MapObjectDetailsShow: componentLoader.add(
//     'MapObjectDetailsShow',
//     './components/show/mapObjectDetailsLink.tsx',
//   ),
//   MultipleImagesShow: componentLoader.add(
//     'MultipleImagesShow',
//     './components/show/multipleImagesShow.tsx',
//   ),
// };

// const colorProperty = {
//   type: 'string',
//   components: {
//     list: Components.Color, // see "Writing your own Components"
//     show: Components.ColorShow,
//   },
// };

// const profilePicProperty = {
//   type: 'string',
//   components: {
//     list: Components.ProfilePic, // see "Writing your own Components"
//     show: Components.ProfilePicShow,
//   },
// };

// const multipleImagesProperty = {
//   type: 'string',
//   components: {
//     // list: Components.ProfilePic, // see "Writing your own Components"
//     show: Components.MultipleImagesShow,
//   },
// };

// const fileProperty = {
//   type: 'string',
//   components: {
//     list: Components.FileLink,
//     show: Components.FileLinkShow,
//   },
// };

// const timestampProperty = {
//   isVisible: {
//     edit: true,
//     show: true,
//     list: false,
//     filter: false,
//   },
// };

// const MapObjectDetailsProperty = {
//   type: 'string',
//   components: {
//     list: Components.MapObjectDetails, // see "Writing your own Components"
//     show: Components.MapObjectDetailsShow,
//   },
// };

// const coordsProperty = {
//   type: 'string',
//   components: {
//     list: Components.Coordinates,
//     show: Components.CoordinatesShow,
//   },
// };

// const approveWorker = async (id: number) => {
//   const usersService = new UsersService();
//   await usersService.approveWorkerOrResetTheirPassword(id);
// };

// const approveChatAd = async (id: number) => {
//   const chatAdService = new ChatAdService(new TransactionsService());
//   await chatAdService.approveChatAd(id);
// };

// const approveWorkerObjectApplication = async (id: number) => {
//   const estateObjectsService = new EstateObjectsService();
//   await estateObjectsService.approveWorkerObject(id);
// };

// const deleteMapObjectWithItsDetails = async (id: number) => {
//   const record = await MapObject.findOne({
//     where: { id: id },
//     include: [{ model: MapObjectDetails }],
//   });
//   await record.destroy();
//   await Complaint.destroy({
//     where: { objectType: 'map object', objectId: id },
//   });
//};

// const deleteMapObjectWithItsDetails = {
//   delete: {
//     actionType: 'record',
//     component: false,
//     handler: (request, response, context) => {
//       const { record, currentAdmin } = context;
//       return {
//         record: record.toJSON(currentAdmin),
//         msg: 'Hello world',
//       };
//     },
//   },
// };

// const UserResource = {
//   resource: User,
//   options: {
//     properties: {
//       createdAt: timestampProperty,
//       updatedAt: timestampProperty,
//     },
//   },
// };

// export const resources = [
// User,
// Category,
// Constraint,
// App,
// Message,
// ChatRoom,
// RoomAccess,
// Product,
// PhoneVerification,
// GlobalCategory,
// Purchase,
// Review,
// ];
