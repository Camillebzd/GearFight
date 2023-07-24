import { Weapon } from "@/scripts/entities";
import { 
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  Text,
  CardFooter,
  Button
} from "@chakra-ui/react";

const WeaponCardHorizontal = ({weapon, onClick, isSelected}: {weapon: Weapon, onClick: () => void, isSelected: boolean}) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      onClick={onClick}
      backgroundColor={isSelected ? "blue" : "transparent"}
    >
      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={weapon.image}
        alt={`image of weapon named ${weapon.name}`}
      />
      <Stack>
        <CardBody>
          <Heading size='md'>{weapon.name}</Heading>

          <Text py='2'>
            {weapon.description}
          </Text>
        </CardBody>

        {/* <CardFooter>
          <Button variant='solid' colorScheme='blue'>
            Buy Latte
          </Button>
        </CardFooter> */}
      </Stack>
    </Card>
  );
}
    
export default WeaponCardHorizontal;