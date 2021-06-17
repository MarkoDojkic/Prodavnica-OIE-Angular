This application is an online store that provides standard ecommerce functionality. Product categories fall into the domain of renewable energy sources (solar panels, wind turbines, battery chargers, accumulators and voltage inverters), and electric vehicles are also on offer. The application covers the following set of functionalities:  
&emsp;• In-store product overview.  
&emsp;• Filter products by: price, available quantity, specific  
&emsp;criteria (such as voltage, current, battery capacity, etc.)  
&emsp;and average product rating.  
&emsp;• Review reviews of users who have purchased the product.  
&emsp;• User login and registration.  
&emsp;• Adding products to the cart, managing it and ordering.  
&emsp;• Modify user profile data, which contains basic data for  
&emsp;contact, payment and information about the user's favorite product types.  
&emsp;• View, cancel and modify current orders.  
&emsp;• Evaluation and review of completed orders.  

The application was realized using the Angular framework on the frontend and the Firebase backend service (Authentication, Firestore - for data storage and Storage - for storing product images). The application is implemented in MVC architecture and has the following structure:  
&emsp;1. Modules  
&emsp;&emsp;• App - Roots module of each Angular project, it invites everyone else  
&emsp;&emsp;modules and components used in the project  
&emsp;&emsp;• Material - Angular Material module that imports everything you need  
&emsp;&emsp;materials from the @ angular / package material.  
&emsp;&emsp;• Router - The module responsible for routing, ie. moving through the pages  
&emsp;&emsp;(components) of the application. It also implements "AngularFireAuthGuard" which controls  
&emsp;&emsp;access to parts of the application depending on whether the user is logged in or not.  
&emsp;2. Components  
&emsp;&emsp;• App - Root component of the application, which also contains a navigation toolbar.  
&emsp;&emsp;• Login - Responsible for forwarding login parameters.  
&emsp;&emsp;• Registration - Responsible for registering new users.  
&emsp;&emsp;• ProfilePage - Responsible for displaying and modifying data.  
&emsp;&emsp;• Shop - Responsible for displaying and filtering products, reviewing its  
&emsp;&emsp;review and add them to the cart (only if the user is logged in).  
&emsp;&emsp;• Cart - Responsible for displaying and modifying the basket, selecting the sending method,  
&emsp;&emsp;an overview of the total amount to be paid and ordered.  
&emsp;&emsp;• Order - Responsible for displaying, modifying and canceling current ones  
&emsp;&emsp;order, review of canceled and completed orders as well as evaluation of ordered products (if the order is completed).  
&emsp;3. Models  
&emsp;&emsp;• Node - Contains interfaces for displaying category types for "tree" material.  
&emsp;&emsp;• Order - Contains an interface for displaying orders  
&emsp;&emsp;• Item - Contains a product display interface  
&emsp;&emsp;• Review - Contains an interface for displaying reviews  
&emsp;4. Services  
&emsp;&emsp;• Crypto - A service that provides AES password encryption service.  
&emsp;&emsp;• IndexedDatabase - Service for communication with indexedDB API.  
&emsp;&emsp;• Firebase - A service that communicates with the Firebase platform.  

NOTE: Before usage populate environament firebase settings with yours. Use Angular version 11.2.14.