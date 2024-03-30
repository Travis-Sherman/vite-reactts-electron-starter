/* eslint-disable react/function-component-definition */
import React, { FC, useState, useEffect } from 'react';
import { getDocs, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ProfileTop: FC = ({ dappInfo, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const addToProfile = () => {
    const userDappsRef = collection(db, `Users/${userEmail}/dapps`);

    addDoc(userDappsRef, {})
      .then((docRef) => {
        setDoc(doc(userDappsRef, docRef.id), {
          docId: docRef.id,
          name: dappInfo.name,
          url: dappInfo.url,
          logo: dappInfo.logo,
          category: dappInfo.category,
          description: dappInfo.description
        });
      })
      .then(() => {
        console.log(dappInfo.name, ' added to profile.');
        if (loading) {
          setLoading(false);
        } else {
          setLoading(true);
        }
      })
      .catch((error) => {
        console.error('Error adding DApp to profile: ', error);
      });
  };

  useEffect(() => {
    // Get All dApps from the dAppStore and the user's dApps
    const getDapp = async () => {
      const dappsImages = await getDocs(collection(db, `Dapps/${dappInfo.docId}/desktop-previews`));
      let imagesurls = [];
      dappsImages.forEach((doc) => {
        imagesurls.push(doc.data().image);
      });
      setImageUrls(imagesurls);

      // Get ALL Dapps that the user has added to their dapphub
      const userDappsAval = await getDocs(collection(db, `Users/${userEmail}/dapps`));
      let userDapps = [];
      let userDappsIds = [];
      userDappsAval.forEach((doc) => {
        userDapps.push(doc.data().name);
        userDappsIds.push(doc.data());
      });
      setAdded(userDapps);
      setAddedIds(userDappsIds);
    };

    getDapp();
  }, [loading]);
  return (
    <>
      <div className="px-7 h-36 bg-yellow-color bg-opacity-20 rounded-t-md">
        <img
          className="relative top-2/3 md:top-1/2 w-20 md:w-28 object-cover rounded-full"
          src={dappInfo.logo}
          alt="profile"
        />
      </div>
      <div className="px-7 py-6 bg-white rounded-b-md">
        {/* <div className="flex justify-end gap-1 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 md:w-3.5 md:h-3.5"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M6.99984 1.16667L8.80234 4.81834L12.8332 5.40751L9.9165 8.24834L10.6048 12.2617L6.99984 10.3658L3.39484 12.2617L4.08317 8.24834L1.1665 5.40751L5.19734 4.81834L6.99984 1.16667Z"
              fill="#EFAC00"
              stroke="#DB980A"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-xs font-semibold ">
            4.9 <span className="text-secondary-color">(Reviews 1,729)</span>
          </h2>
        </div> */}
        <div className="flex flex-col md:flex-row gap-6 text-center md:text-left justify-between mt-8 md:mt-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">{dappInfo.name}</h2>
            <p className="text-yellow-color text-sm md:text-base font-medium mt-3 md:mt-4">{dappInfo.category}</p>
          </div>
          <ul className="flex gap-2 text-xs md:text-sm font-normal">
            <li>
              {added.includes(dappInfo.name) === false ? (
                <button
                  onClick={addToProfile}
                  className="flex gap-1 items-center bg-black bg-opacity-5 py-2 px-4 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 md:w-3.5 md:h-3.5"
                    width="14"
                    height="14"
                    viewBox="0 0 14 15"
                    fill="none"
                  >
                    <path
                      d="M2.9165 7.5H11.0832"
                      stroke="black"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 3.41666V11.5833"
                      stroke="black"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Add
                </button>
              ) : (
                <button className="flex gap-1 items-center bg-black bg-opacity-5 py-2 px-4 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 md:w-3.5 md:h-3.5"
                    width="14"
                    height="14"
                    viewBox="0 0 14 15"
                    fill="none"
                  >
                    <path
                      d="M2.9165 7.5H11.0832"
                      stroke="black"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 3.41666V11.5833"
                      stroke="black"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Added
                </button>
              )}
            </li>
            {/* <li>
              <button className="bg-yellow-color py-2 px-4 flex items-center rounded-lg">Try Now</button>
            </li> */}
          </ul>
        </div>
        <svg
          className="my-7 w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="580"
          height="2"
          viewBox="0 0 580 2"
          fill="none"
        >
          <path opacity="0.1" d="M0 1L580 1.00005" stroke="black" />
        </svg>
        <h2 className="text-xs md:text-sm font-medium text-secondary-color">DESCRIPTION</h2>
        <p className="text-sm md:text-base leading-snug font-semibold mt-4">{dappInfo.description}</p>
      </div>
    </>
  );
};

export default ProfileTop;
