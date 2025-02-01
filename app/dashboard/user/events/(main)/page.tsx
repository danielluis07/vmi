import { getEvents } from "@/app/_features/users/actions/get-events";
import { auth } from "@/auth";

const UserEventsPage = async () => {
  const session = await auth();
  const userId = session?.user.id;

  if (!session || !userId) {
    return <div>Não autorizado</div>;
  }

  const data = await getEvents(userId);
  return (
    <div>
      {data.map((event, index) => (
        <div key={index}>{event.events.name}</div>
      ))}
    </div>
  );
};

export default UserEventsPage;
