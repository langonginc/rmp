import rmgRuntime from '@railmapgen/rmg-runtime';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Flex,
    Heading,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Tag,
    TagLabel,
    Text,
    VStack,
} from '@chakra-ui/react';
import GithubIcon from '../../images/github-mark.svg';
import SlackIcon from '../../images/slack-mark.svg';

const AboutModal = (props: { isOpen: boolean; onClose: () => void }) => {
    const { isOpen, onClose } = props;
    const { t } = useTranslation();
    const appVersion = rmgRuntime.getAppVersion();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('header.about.title')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody paddingBottom={10}>
                    <Flex direction="row">
                        <Image boxSize="128px" src={process.env.PUBLIC_URL + '/logo192.png'} />
                        <Flex direction="column" width="100%" alignItems="center" justifyContent="center">
                            <Text fontSize="xl" as="b">
                                {t('header.about.rmp')}
                            </Text>
                            <Text>{appVersion}</Text>
                            <Text />
                            <Text fontSize="sm">{t('header.about.railmapgen')}</Text>
                        </Flex>
                    </Flex>

                    <Box margin={5}>
                        <Text fontSize="xl">{t('header.about.desc')}</Text>
                    </Box>

                    <Heading as="h5" size="sm" mt={3} mb={2}>
                        {t('header.about.contributors')}
                    </Heading>

                    <Heading as="h6" size="xs" my={2}>
                        {t('header.about.coreContributors')}
                    </Heading>

                    <VStack>
                        <Tag
                            size="lg"
                            w="85%"
                            onClick={() => window.open('https://github.com/thekingofcity', '_blank')}
                            cursor="pointer"
                        >
                            <Avatar src="https://github.com/thekingofcity.png" size="lg" my={2} ml={-1} mr={2} />
                            <TagLabel display="block" width="100%">
                                <Text fontSize="lg" fontWeight="bold" mb={1}>
                                    thekingofcity
                                </Text>
                                <Text fontSize="sm">{t('header.about.content1')}</Text>
                                <Text fontSize="sm" align="right" mb={1}>
                                    {t('header.about.content2')}
                                </Text>
                            </TagLabel>
                        </Tag>
                    </VStack>

                    <Heading as="h6" size="xs" my={2}>
                        {t('header.about.styleContributors')}
                    </Heading>

                    <VStack>
                        <Tag
                            size="lg"
                            w="85%"
                            onClick={() => window.open('https://github.com/203IhzElttil', '_blank')}
                            cursor="pointer"
                        >
                            <Avatar src="https://github.com/203IhzElttil.png" size="lg" my={2} ml={-1} mr={2} />
                            <TagLabel display="block" width="100%">
                                <Text fontSize="lg" fontWeight="bold" mb={1}>
                                    203IhzElttil
                                </Text>
                                <Text fontSize="sm" mb={1}>
                                    {t('header.about.203IhzElttil')}
                                </Text>
                            </TagLabel>
                        </Tag>
                    </VStack>

                    <Heading as="h5" size="sm" mt={3} mb={2}>
                        {t('header.about.contactUs')}
                    </Heading>

                    <VStack>
                        <Tag
                            size="lg"
                            w="85%"
                            onClick={() => window.open('https://github.com/railmapgen/rmp/issues', '_blank')}
                            cursor="pointer"
                        >
                            <Avatar src={GithubIcon} size="lg" my={2} ml={-1} mr={2} />
                            <TagLabel display="block" width="100%">
                                <Text fontSize="lg" fontWeight="bold" mb={1}>
                                    {t('header.about.github')}
                                </Text>
                                <Text fontSize="sm">{t('header.about.githubContent')}</Text>
                            </TagLabel>
                        </Tag>
                        <Tag
                            size="lg"
                            w="85%"
                            onClick={() =>
                                window.open(
                                    'https://join.slack.com/t/railmapgenerator/shared_invite/zt-1odhhta3n-DdZF~fnVwo_q0S0RJmgV8A',
                                    '_blank'
                                )
                            }
                            cursor="pointer"
                        >
                            <Avatar src={SlackIcon} size="lg" my={2} ml={-1} mr={2} />
                            <TagLabel display="block" width="100%">
                                <Text fontSize="lg" fontWeight="bold" mb={1}>
                                    {t('header.about.slack')}
                                </Text>
                                <Text fontSize="sm">{t('header.about.slackContent')}</Text>
                                <Text fontSize="sm" as="i">
                                    #rmg, #rmp, #palette-and-templates, #random
                                </Text>
                            </TagLabel>
                        </Tag>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AboutModal;
