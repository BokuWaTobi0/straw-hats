import { useUserAuthContext } from "../../contexts/user-auth-context.context";
import { signOutUser } from "../../utils/firebase";

const User = () => {

    const {user}=useUserAuthContext();

    return ( 
        <div className="user-div">
            <p>{user?.email}</p>
            {/* <p></p> */}
            <button className="c-btn" onClick={signOutUser} >signout</button>
        </div>
     );
}
 
export default User;