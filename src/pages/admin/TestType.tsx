// Component that accepts a {[key: string]: any} type
type GenericProps = { [key: string]: any };

const GenericComponent: React.FC<GenericProps> = (props) => {
  return (
    <div>
      {Object.entries(props).map(([key, value]) => (
        <p key={key}>
          {key}: {JSON.stringify(value)}
        </p>
      ))}
    </div>
  );
};

// Interface for specific type
interface SpecificProps {
  name: string;
  age: number;
  isAdmin: boolean;
}

// Component that uses GenericComponent with a specific type
const SpecificComponent: React.FC<SpecificProps> = (props) => {
  return <GenericComponent {...props} />;
};

export default SpecificComponent;
