"use client";

import { useEffect, useMemo, useState } from "react";
import {
    View,
    Flex,
    Heading,
    Text,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CheckboxField,
    Loader,
    useTheme,
    Input,
    Label,
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

import { generateClient } from "aws-amplify/data";
import type { AutomationsSchema } from "@/../amplify/data/resource";
import { useRouter } from "next/navigation";

const client = generateClient<AutomationsSchema>();

type AutomationsRecord = AutomationsSchema["Automation"]["type"];

export default function ClientsPage() {
    const [automations, setAutomations] = useState<AutomationsRecord[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(0)
    const router = useRouter();

    const { tokens } = useTheme();

    const filteredAutomations = useMemo(() => {
        if (!search) {
            return automations;
        }

        return automations.filter((automation) =>
            automation.clientId?.toLowerCase().includes(search.toLowerCase()),
        );

    }, [search, automations]);

    
    useEffect(() => {
        let raceCondition = true

        const fetchClients = async () => {
            try {
                setLoading(true);

                const { data } = await client.models.Automation.list();
                console.log(data)

                if (raceCondition)
                {
                    setAutomations(data);
                }
            } catch (error) {
                console.error("Error fetching automations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients()

        return () => {
            raceCondition = false
        }
    }, [refreshData]);


    const formatDate = (date?: string | null) => {
        if (!date) return "-";

        return new Intl.DateTimeFormat("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(new Date(date));
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, automation: AutomationsRecord) => {
        router.push("/clients/setup?id=" + automation.id)
    }

    return (
        <View padding="34px 42px">
            <Flex
                justifyContent="space-between"
                alignItems="center"
                marginBottom="28px"
            >
                <Heading level={2}>Clients</Heading>

                <Button variation="primary" padding="12px 26px" onClick={() => router.push("/clients/setup")} >
                    SETUP NEW CLIENT
                </Button>
            </Flex>

            {/* Search + Count */}
            <Flex
                justifyContent="space-between"
                alignItems="center"
                marginBottom="12px"
            >
                <Input
                    placeholder="Search by Client Name"
                    width="320px"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    backgroundColor="white"
                />

                <Flex alignItems="center" gap="18px">
                    <Button
                        variation="link"
                        onClick={() => setRefreshData(prev => prev + 1)}
                        style={{
                            width: "32px",
                            padding: 0,
                            fontSize: "22px",
                            color: "#6b7280",
                        }}
                    >
                        ↻
                    </Button>

                    <Text fontSize="15px" color="#6b7280">
                        Showing {filteredAutomations.length} automations
                    </Text>
                </Flex>
            </Flex>

            {/* Table */}
            <View
                backgroundColor="white"
                borderRadius="4px"
                overflow="hidden"
                border="1px solid #d7dee7"
            >
                <Table variation="striped" highlightOnHover={false}>
                    <TableHead backgroundColor="#dcecf7">
                        <TableRow height="58px">
                            <TableCell width="54px">
                                {/* <CheckboxField
                                    label=""
                                    name="select-all"
                                    value="all"
                                    isDisabled
                                    className="cursor-none!"
                                /> */}
                            </TableCell>

                            <TableCell fontWeight={700}>Client Name</TableCell>

                            <TableCell fontWeight={700}>Client ID</TableCell>

                            <TableCell fontWeight={700}>Status</TableCell>

                            <TableCell fontWeight={700}>Created Date</TableCell>

                            <TableCell fontWeight={700}>
                                Last Updated Date
                            </TableCell>

                            <TableCell fontWeight={700}>Edit</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <Flex
                                        justifyContent="center"
                                        padding="48px"
                                    >
                                        <Loader size="large" />
                                    </Flex>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAutomations.map((automationRow) => (
                                <TableRow key={automationRow.id} height="66px">
                                    <TableCell>
                                        <CheckboxField
                                            label=""
                                            name={automationRow.id}
                                            value={automationRow.id}
                                        />
                                    </TableCell>

                                    <TableCell fontSize="15px">
                                        {automationRow.clientName}
                                    </TableCell>

                                    <TableCell>{automationRow.clientId}</TableCell>

                                    <TableCell fontWeight={500}>
                                        {automationRow.automationDetails.isScheduled ? "Scheduled" : "Inactive"}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(automationRow.createdAt)}
                                    </TableCell>

                                    <TableCell>
                                        {formatDate(automationRow.updatedAt)}
                                    </TableCell>

                                    <TableCell>
                                        <Button
                                            variation="link"
                                            colorTheme="warning"
                                            size="small"
                                            onClick={(e) => handleEdit(e, automationRow)}
                                        >
                                            ✎
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </View>
        </View>
    );
}
