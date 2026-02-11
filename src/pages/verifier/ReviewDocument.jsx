
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const ReviewDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDoc = async () => {
            const res = await api.get(`/verifier/document/${id}`);
            setDoc(res.data);
        };
        fetchDoc();
    }, [id]);

    const approve = async () => {
        if (!window.confirm("Approve this document?")) return;

        setLoading(true);
        await api.patch(`/verifier/document/${id}/approve`);
        setLoading(false);
        navigate("/verifier/queue");
    };

    const reject = async () => {
        if (!window.confirm("Reject this document?")) return;

        setLoading(true);
        await api.patch(`/verifier/document/${id}/reject`);
        setLoading(false);
        navigate("/verifier/queue");
    };

    if (!doc) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-2 gap-6">

            {/* Document Preview */}
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-3">
                    Document Preview
                </h3>

                <iframe
                    src={doc.previewUrl}
                    title="Document"
                    className="w-full h-[500px] border"
                />
            </div>

            {/* Review Panel */}
            <div className="bg-white p-6 rounded shadow space-y-4">
                <h3 className="font-semibold">
                    Review Details
                </h3>

                <p>
                    <strong>Owner:</strong> {doc.ownerName}
                </p>

                <p>
                    <strong>AI Result:</strong> {doc.aiStatus}
                </p>

                <p className="break-all text-sm">
                    <strong>SHA256:</strong> {doc.sha256Hash}
                </p>

                <p>
                    <strong>Blockchain:</strong>{" "}
                    {doc.blockchainHash
                        ? "Anchored"
                        : "Not Anchored"}
                </p>

                <div className="flex gap-4 pt-4">
                    <button
                        disabled={loading}
                        onClick={approve}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Approve
                    </button>

                    <button
                        disabled={loading}
                        onClick={reject}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Reject
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ReviewDocument;
